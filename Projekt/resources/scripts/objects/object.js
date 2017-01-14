app.objects.object = function(position,bodyModel,wheelModel,terrain){

    this.model = bodyModel;
    this.wheelModel = wheelModel;
    this.wheelOffset = this.model.model.wheeloffset;
    this.position = (position);
    this.rotation = [0,0,0];
    this.worldMatrix = mat4.create();
    this.workMatrix = mat4.create();

    this.forwardVector = vec3.fromValues(0,0,1);
    this.rightVector = vec3.fromValues(1,0,0);
    this.upVector = vec3.fromValues(0,1,0);

    this.terrain = terrain;

    this.acceleration = 0.00005;
    this.breakFactor = 2*this.acceleration;
    this.rotationFactor = 0.15;

    this.accelerate = false;
    this.break = false;
    this.maxSpeed = 0.03;
    this.speed = 0.0;

    // NAIVE MOVEMENT
    //this.wheelRotationSpeed = 0.5;
    this.reverse = false;
    this.wheelRotationSpeed = 0.1;
    this.wheelAngle = 0.0;
    //this.maxAngle = 30;
    this.maxAngle = 20;

    this.wheelRotateLeft = false;
    this.wheelRotateRight = false;
    this.wheelXAngle = 0.0;
    this.wheelRadius = 2*this.wheelOffset['fl'][2];

    this.renderWheel = function(gl,shader,offset,yRotation){
        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);
        var pos = vec3.clone(offset);
        mathUtils.rotateMat4(this.worldMatrix,yRotation);
        mat4.fromTranslation(this.workMatrix,pos);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        mathUtils.rotateCurrMat4(this.worldMatrix,this.rotation);
        mat4.fromTranslation(this.workMatrix,this.position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.wheelModel.render(gl,shader);
    };

    this.render = function(gl,shader){
        mat4.identity(this.worldMatrix);
        mathUtils.rotateMat4(this.worldMatrix,this.rotation);

        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);
        mat4.fromTranslation(this.workMatrix,this.position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);

        var angle = this.wheelAngle/360  * 2 * Math.PI;

        this.renderWheel(gl,shader,this.wheelOffset['fr'],[this.wheelXAngle,-angle,0]);
        this.renderWheel(gl,shader,this.wheelOffset['fl'],[-this.wheelXAngle,-angle+Math.PI,0]);
        this.renderWheel(gl,shader,this.wheelOffset['rr'],[this.wheelXAngle,0,0]);
        this.renderWheel(gl,shader,this.wheelOffset['rl'],[-this.wheelXAngle,Math.PI,0]);
    };

    this.update = function(deltaTime){

        if (this.reverse == false){
            if (this.accelerate === true){
                this.speed += this.acceleration * deltaTime;
                if (this.speed >  this.maxSpeed) this.speed = this.maxSpeed;
            }
            if  (this.break === true){
                this.speed -= this.breakFactor*deltaTime;
                if (this.speed < 0) this.speed = 0;
            }
        } else {
            if (this.accelerate === true){
                this.speed -= this.acceleration * deltaTime;
                if (this.speed <  -this.maxSpeed) this.speed = -this.maxSpeed;
            }
            if  (this.break === true){
                this.speed += this.breakFactor*deltaTime;
                if (this.speed > 0) this.speed = 0;
            }
        }

        if (this.wheelRotateRight===true){
            this.wheelAngle += deltaTime*this.wheelRotationSpeed;
            if (this.wheelAngle>this.maxAngle) this.wheelAngle = this.maxAngle;
        }
        else if (this.wheelRotateLeft===true){
            this.wheelAngle -= deltaTime*this.wheelRotationSpeed;
            if (this.wheelAngle<-this.maxAngle) this.wheelAngle = -this.maxAngle;
        }
        else {
            var deltaAngle = deltaTime*this.wheelRotationSpeed;
            if (this.wheelAngle>0) this.wheelAngle = this.wheelAngle>deltaAngle? this.wheelAngle-deltaAngle : 0;
            else if (this.wheelAngle<0) this.wheelAngle = this.wheelAngle<-deltaAngle? this.wheelAngle+deltaAngle : 0;
        }

        var forward = this.getForwardVector();
        var right = this.getRightVector();
        var cross = right;
        vec3.cross(cross,right,forward);

        var angle = this.wheelAngle/360  * 2 * Math.PI;
        var rotSpeed = this.speed*Math.sin(angle)*this.rotationFactor*deltaTime;

        var rot = vec3.clone(cross);
        vec3.normalize(rot,rot);
        vec3.scale(rot,rot,rotSpeed);
        vec3.add(this.rotation,this.rotation,rot);
        //console.log(this.rotation);*/
        //this.rotation[1]-=rotSpeed;

        mat4.fromRotation(this.workMatrix,angle,cross);
        vec3.transformMat4(forward,forward,this.workMatrix);

        var momentarySpeed = this.speed * Math.cos(angle)*deltaTime;
        vec3.scale(forward,forward,momentarySpeed);
        vec3.add(this.position,this.position,forward);

        this.wheelXAngle += momentarySpeed/this.wheelRadius;

        //this.interpolateSlope();
    };

    this.setSpeed = function(val){
        this.speed = val;
    };

    this.getPosition = function(){
        return vec3.clone(this.position);
    };

    this.getForwardVector = function(){
        var forward = vec3.clone(this.forwardVector);
        mathUtils.rotateVec3(forward,this.rotation);
        return forward;
    };

    this.getRightVector = function(){
        var right = vec3.clone(this.rightVector);
        mathUtils.rotateVec3(right,this.rotation);
        return right;
    };

    this.interpolateSlope = function(){
        var fl,fr,rl,rr;
        fl = vec3.clone(this.wheelOffset['fl']);
        fr = vec3.clone(this.wheelOffset['fr']);
        rl = vec3.clone(this.wheelOffset['rl']);
        rr = vec3.clone(this.wheelOffset['rr']);

        vec3.add(fl,fl,this.position);
        vec3.add(fr,fr,this.position);
        vec3.add(rl,rl,this.position);
        vec3.add(rr,rr,this.position);

        if (isNaN(fl[0])) {
            console.log(this.wheelOffset);
            console.log(this.position);
        }
        var angles = this.terrain.interpolateSlope(fl,fr,rl,rr);

        //console.log(angles);
        //this.rotation[0] = angles[0];
        //this.rotation[2] = angles[2];
    };

    this.getMomentaryData = function(){
        var data = {};
        data.speed = this.speed;
        data.position = vec3.clone(this.position);
        return data;
    }

};
