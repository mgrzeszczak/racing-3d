app.objects.object = function(position,model){

    this.model = model;
    this.position = position;
    this.rotation = [0,0,0];

    this.worldMatrix = mat4.create();
    this.workMatrix = mat4.create();

    this.render = function(gl,shader){
        mat4.identity(this.worldMatrix);

        mat4.fromXRotation(this.workMatrix,this.rotation[0]);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mat4.fromYRotation(this.workMatrix,this.rotation[1]);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mat4.fromZRotation(this.workMatrix,this.rotation[2]);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);
    };

    this.update = function(){
        var angle = performance.now()/1000 / 6*2*Math.PI;
        this.rotation = [0,angle,0];
    };

};
