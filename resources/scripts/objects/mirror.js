app.objects.mirror = function(data,target,camPosOffset,lookAtOffset,model,modelScale,modelPosOffset,modelRotation){

    this.data = data;
    this.camera = new app.objects.camera([0,0,0],[0,0,0]);
    this.target = target;
    this.camPosOffset = camPosOffset;
    this.lookAtOffset = lookAtOffset;
    this.model = model;
    this.modelScale = modelScale;
    this.modelPosOffset = modelPosOffset;
    this.modelRotation = modelRotation;

    this.worldMatrix = mat4.create();
    this.workMatrix = mat4.create();
    
    this.renderToTexture = function(gl,renderFunction){
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.data[0]);
        gl.viewport(0,0,this.data[0].width,this.data[0].height);

        var forward = target.getForwardVector();
        var right = target.getRightVector();

        var up = vec3.clone(forward);
        vec3.cross(up,forward,right);
        vec3.scale(up,up,this.camPosOffset[1]);
        vec3.scale(right,right,this.camPosOffset[0]);

        var camPos = vec3.clone(target.position);
        vec3.add(camPos,camPos,right);
        vec3.add(camPos,camPos,up);

        var lookAt = vec3.clone(target.position);
        vec3.scale(forward,forward,this.lookAtOffset[2]);
        vec3.add(lookAt,lookAt,forward);

        this.camera.position = camPos;
        this.camera.lookAt = lookAt;
        app.setCamera(this.camera);

        renderFunction(false);

        gl.bindTexture(gl.TEXTURE_2D, this.data[1]);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    };

    this.render = function(gl,shader){
        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);

        var rotation = target.rotation;
        var position = target.position;

        mat4.identity(this.worldMatrix);
        mat4.fromScaling(this.worldMatrix,this.modelScale);

        mathUtils.rotateMat4(this.workMatrix,this.modelRotation);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mat4.fromTranslation(this.workMatrix,this.modelPosOffset);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mathUtils.rotateMat4(this.workMatrix,rotation);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.renderWithTexture(gl,shader,this.data[1]);
    }



};