app.objects.skybox = function(model,target){

    this.model = model;
    this.worldMatrix = mat4.create();
    this.workMatrix = mat4.create();

    this.shader = app.shaderLoader.getStaticShader();

    this.render = function(gl){
        var shader = this.shader;
        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);

        mat4.identity(this.worldMatrix);
        mat4.fromScaling(this.worldMatrix,[50,50,50]);

        mat4.fromTranslation(this.workMatrix,target.getPosition());
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);

        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);
    };

};