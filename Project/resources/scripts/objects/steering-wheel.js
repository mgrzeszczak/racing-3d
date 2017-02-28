app.objects.steeringWheel = function(model,car,posOffset){

    this.car = car;
    this.model = model;
    this.worldMatrix = mat4.create();
    this.workMatrix = mat4.create();
    this.positionOffset = posOffset;

    this.render = function(gl,shader){
        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);

        mat4.identity(this.workMatrix);
        mat4.identity(this.worldMatrix);
        
        var rotation = this.car.rotation;
        var position = this.car.position;

        mat4.identity(this.worldMatrix);

        mathUtils.rotateCurrMat4(this.workMatrix,[0,-this.car.wheelAngle/360  * 2 * Math.PI,0]);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mathUtils.rotateCurrMat4(this.workMatrix,[-Math.PI/2,0,0]);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mat4.fromTranslation(this.workMatrix,this.positionOffset);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mathUtils.rotateMat4(this.workMatrix,rotation);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);
    }

};