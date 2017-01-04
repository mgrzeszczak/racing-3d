var physics = (function(){

    var FRICTION_MAGNITUDE = 1.0;





    var vector = function(value){

        this.value = value;

        this.clone = function(){
            return vec3.clone(this.value);
        };

        this.direction = function(){
            var copy = this.clone();
            return vec3.normalize(copy,copy);
        };

        this.add = function(vector){

        };


    };

    vector.create = function(){

    };

    var force = function(magnitude,direction){
        this.magnitude = magnitude;
        this.direction = direction;

        this.getMagnitude = function(){
            return magnitude;
        };

        this.getDirection = function(){
            return vec3.clone(this.direction);
        };

        this.getVector = function(){
            var f = this.getDirection();
            vec3.scale(f,f,magnitude);
            return f;
        }
    };

    function calculateNetForce(forces){
        var netForceVector = vec3.fromValues(0,0,0);
        forces.forEach(function(force){
           vec3.add(netForceVector,netForceVector,force.getVector());
        });
        var length = vec3.length(netForceVector);
        var netForceDirection = vec3.clone(netForceVector);
        vec3.normalize(netForceDirection,netForceDirection);

        var frictionForceVector = vec3.fromValues(netForceDirection[0],0,netForceDirection[2]);
        frictionForceVector.scale(frictionForceVector,frictionForceVector,-FRICTION_MAGNITUDE);

        var groundForce = vec3.fromValues(netForceVector[0],0,netForceVector[2]);
        //if (vec3.length(groundForce)<frictionForceVector.)

        return new force(length,netForceVector);
    }

    return {
        force : force,
    }


});