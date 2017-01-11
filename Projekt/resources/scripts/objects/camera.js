app.objects.camera = function(position,lookAt){

    this.position = position;
    this.lookAt = lookAt;
    this.viewMatrix = mat4.create();
    this.up = [0,1,0];

    this.targetPosition = null;
    //this.movementSpeed = 0.025;
    this.speedScale = 0.75;
    this.minSpeed = 0.005;

    this.maxDistance = 7.5;

    this.getViewMatrix = function(){
        mat4.lookAt(this.viewMatrix,this.position,this.lookAt,this.up);
        return this.viewMatrix;
    };

    this.update = function(deltaTime){

        if (this.followedTarget != undefined){

            this.movementSpeed = this.speedScale * this.followedTarget.speed;
            if (this.movementSpeed<this.minSpeed) this.movementSpeed = this.minSpeed;

            this.lookAt = this.calculateLookAt(this.followedTarget);
            this.targetPosition = this.calculateTargetPosition(this.followedTarget);

            var dir = vec3.clone(this.targetPosition);
            vec3.subtract(dir,dir,this.position);
            var distanceBefore = vec3.length(dir);
            vec3.normalize(dir,dir);

            if (deltaTime*this.movementSpeed>distanceBefore){
                this.position = this.targetPosition;
                return;
            }

            var oldPosition = vec3.clone(this.position);
            vec3.scale(dir,dir,deltaTime*this.movementSpeed);
            vec3.add(this.position,this.position,dir);

            dir = vec3.clone(this.targetPosition);
            vec3.subtract(dir,dir,this.position);
            var distance = vec3.length(dir);


            if (distance > this.maxDistance){
                dir = vec3.clone(this.position);
                vec3.subtract(dir,dir,this.targetPosition);
                vec3.normalize(dir,dir);
                vec3.scale(dir,dir,this.maxDistance);
                vec3.add(dir,dir,this.targetPosition);
                this.position = dir;
            }

        }
    };

    this.calculateTargetPosition = function(target){
        var targetPosition = vec3.clone(target.getPosition());
        var forward = target.getForwardVector();
        vec3.scale(forward,forward,10);
        vec3.subtract(targetPosition,targetPosition,forward);
        vec3.add(targetPosition,targetPosition,[0,3,0]);
        return targetPosition;
    };

    this.calculateLookAt = function(target){
        var pos = target.getPosition();
        var forward = target.getForwardVector();
        vec3.scale(forward,forward,10);
        vec3.add(pos,pos,forward);
        return pos;
    };

    this.setTarget = function(target){
        this.followedTarget = undefined;
        this.lookAt = target.position===undefined? target : target.position;
    };

    this.followTarget = function(target){
        this.followedTarget = target;
        this.position = this.calculateTargetPosition(this.followedTarget);
    };
};