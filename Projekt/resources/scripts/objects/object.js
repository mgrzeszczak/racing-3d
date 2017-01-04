app.objects.object = function(position,bodyModel,wheelModel){

    this.model = bodyModel;
    this.wheelModel = wheelModel;
    this.wheelOffset = this.model.model.wheeloffset;
    this.position = (position);
    this.rotation = [0,0,0];
    this.worldMatrix = mat4.create();
    this.workMatrix = mat4.create();
    this.forwardVector = vec3.fromValues(0,0,1);


    // NAIVE MOVEMENT
    this.wheelRotationSpeed = 0.5;
    this.speed = 0.0;
    this.wheelAngle = 0.0;
    this.maxAngle = 30;
    this.wheelRotateLeft = false;
    this.wheelRotateRight = false;

    //this.forces = [];
    //this.netForce = vec3.fromValues(0,0,0);
    //this.acceleration = vec3.fromValues(0,0,0);
    //this.velocity = vec3.fromValues(0,0,0);

    this.render = function(gl,shader){
        mat4.identity(this.worldMatrix);
        mathUtils.rotateMat4(this.worldMatrix,this.rotation);

        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);
        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);



        var angle = this.wheelAngle/360  * 2 * Math.PI;

        //var rotLeft = [0,Math.PI,0];
        var rot = [0,-angle,0];


        var pos = vec3.clone(this.wheelOffset['fl']);
        mathUtils.rotateMat4(this.worldMatrix,rot);
        mat4.fromTranslation(this.workMatrix,pos);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        mathUtils.rotateCurrMat4(this.worldMatrix,this.rotation);
        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.wheelModel.render(gl,shader);

        pos = vec3.clone(this.wheelOffset['fr']);
        mathUtils.rotateMat4(this.worldMatrix,rot);
        mat4.fromTranslation(this.workMatrix,pos);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        mathUtils.rotateCurrMat4(this.worldMatrix,this.rotation);
        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.wheelModel.render(gl,shader);

        pos = vec3.clone(this.wheelOffset['rl']);
        mat4.identity(this.worldMatrix);
        mat4.fromTranslation(this.workMatrix,pos);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        mathUtils.rotateCurrMat4(this.worldMatrix,this.rotation);
        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.wheelModel.render(gl,shader);

        pos = vec3.clone(this.wheelOffset['rr']);
        mat4.identity(this.worldMatrix);
        mat4.fromTranslation(this.workMatrix,pos);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        mathUtils.rotateCurrMat4(this.worldMatrix,this.rotation);
        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.wheelModel.render(gl,shader);
    };

    this.update = function(deltaTime){
        /*console.log(this.wheelRotateRight);
        console.log(deltaTime);
        console.log(this.wheelRotationSpeed);*/
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
        //console.log(this.wheelAngle);

        //var angle = performance.now()/1000 / 6*2*Math.PI;
        //this.rotation = [0,angle,0];

        var angle = this.wheelAngle/360  * 2 * Math.PI;
        var rotSpeed = this.speed*Math.sin(angle)*0.02;
        this.rotation[1]-=rotSpeed*deltaTime;


        var forward = this.getForwardVector();

        mathUtils.rotateVec3(forward,[0,-angle,0]);
        //vec3.scale(forward,forward,0.1);
        vec3.scale(forward,forward,this.speed * Math.cos(angle));
        vec3.add(this.position,this.position,forward);
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

};
