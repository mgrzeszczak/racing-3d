app.objects.camera = function(position,lookAt){

    this.position = position;
    this.lookAt = lookAt;
    this.viewMatrix = mat4.create();
    this.up = [0,1,0];

    this.getViewMatrix = function(){
        mat4.lookAt(this.viewMatrix,this.position,this.lookAt,this.up);
        return this.viewMatrix;
    };

    this.update = function(deltaTime){

        if (this.followedTarget != undefined){
            this.position = this.followedTarget.getPosition();
            var forwardVector = this.followedTarget.getForwardVector();

            var lookAt = vec3.clone(forwardVector);
            vec3.scale(lookAt,lookAt,10);
            vec3.add(lookAt,this.position,lookAt);
            this.lookAt = lookAt;

            vec3.scale(forwardVector,forwardVector,10);
            vec3.subtract(this.position,this.position,forwardVector);
            vec3.add(this.position,this.position,[0,5,0]);
        }
    };

    this.setTarget = function(target){
        this.followedTarget = undefined;
        this.lookAt = target.position===undefined? target : target.position;
    };

    this.followTarget = function(target){
        this.followedTarget = target;
    };
};