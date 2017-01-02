app.objects.object = function(position,model){

    this.model = model;
    this.position = (position);
    this.rotation = [0,0,0];

    this.worldMatrix = mat4.create();
    this.workMatrix = mat4.create();

    this.forwardVector = vec3.fromValues(0,0,1);

    this.render = function(gl,shader){
        mat4.identity(this.worldMatrix);
        mathUtils.rotateMat4(this.worldMatrix,this.rotation);

        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);
    };

    this.update = function(){
        var angle = performance.now()/1000 / 6*2*Math.PI;
        this.rotation = [0,angle,0];

        var forward = vec3.clone(this.forwardVector);
        mathUtils.rotateVec3(forward,this.rotation);
        vec3.scale(forward,forward,0.1);
        vec3.add(this.position,this.position,forward);
    };

};
