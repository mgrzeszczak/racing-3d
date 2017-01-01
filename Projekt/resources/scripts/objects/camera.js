app.objects.camera = function(position,lookAt){

    this.position = position;
    this.lookAt = lookAt;
    this.viewMatrix = mat4.create();
    this.up = [0,1,0];

    this.getViewMatrix = function(){
        mat4.lookAt(this.viewMatrix,this.position,this.lookAt,this.up);
        return this.viewMatrix;
    }

};