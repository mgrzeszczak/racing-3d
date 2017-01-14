app.objects.staticObject = function(model,translation,rotation,scaling){

    this.model = model;
    this.translation = translation;
    this.rotation = rotation;
    this.scaling = scaling;
    this.worldMatrix = mathUtils.worldMatrix(translation,rotation,scaling);

    this.render = function(gl,shader){
        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);
    }

};