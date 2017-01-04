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
    this.wheelXAngle = 0.0;
    this.wheelRadius = 2*this.wheelOffset['fl'][2];

    //this.forces = [];
    //this.netForce = vec3.fromValues(0,0,0);
    //this.acceleration = vec3.fromValues(0,0,0);
    //this.velocity = vec3.fromValues(0,0,0);

    this.renderWheel = function(gl,shader,offset,yRotation){
        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);
        var pos = vec3.clone(offset);
        mathUtils.rotateMat4(this.worldMatrix,yRotation);
        mat4.fromTranslation(this.workMatrix,pos);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        mathUtils.rotateCurrMat4(this.worldMatrix,this.rotation);
        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.wheelModel.render(gl,shader);
    };

    this.render = function(gl,shader){
        mat4.identity(this.worldMatrix);
        mathUtils.rotateMat4(this.worldMatrix,this.rotation);

        var worldMatrixUniformLocation = gl.getUniformLocation(shader,app.names.SHADER_WORLD_MATRIX);
        mat4.fromTranslation(this.workMatrix,position);
        mat4.multiply(this.worldMatrix,this.workMatrix,this.worldMatrix);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,this.worldMatrix);
        this.model.render(gl,shader);



        var angle = this.wheelAngle/360  * 2 * Math.PI;

        this.renderWheel(gl,shader,this.wheelOffset['fr'],[this.wheelXAngle,-angle,0]);
        this.renderWheel(gl,shader,this.wheelOffset['fl'],[this.wheelXAngle,-angle+Math.PI,0]);
        this.renderWheel(gl,shader,this.wheelOffset['rr'],[this.wheelXAngle,0,0]);
        this.renderWheel(gl,shader,this.wheelOffset['rl'],[this.wheelXAngle,Math.PI,0]);
    };

    this.update = function(deltaTime){
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
        var rotSpeed = this.speed*Math.sin(angle)*0.02*deltaTime;
        this.rotation[1]-=rotSpeed*deltaTime;

        var forward = this.getForwardVector();

        mathUtils.rotateVec3(forward,[0,-angle,0]);
        //vec3.scale(forward,forward,0.1);
        var momentarySpeed = this.speed * Math.cos(angle)*deltaTime;
        vec3.scale(forward,forward,momentarySpeed);
        vec3.add(this.position,this.position,forward);

        this.wheelXAngle += momentarySpeed/this.wheelRadius;
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
