app.objects.skybox = function(model){

    this.model = model;

    this.worldMatrix = mat4.create();

    this.render = function(gl,shader){
        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);

        mat4.identity(this.worldMatrix);
        mat4.fromScaling(this.worldMatrix,[50,50,50]);

        //mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);
    };

};