app.objects.reflectorLight = function(color,ambient,attenuation,target,offsetXZ){

    this.color = new Float32Array(color);
    this.ambient = new Float32Array(ambient);
    this.attenuation = attenuation;
    this.offsetXZ = offsetXZ;
    this.target = target;

    this.getPosition = function(){
        var pos = this.target.getPosition();
        var forward = this.target.getForwardVector();
        vec3.normalize(forward,forward);
        vec3.scale(forward,forward,3);
        //vec3.add(pos,pos,this.offset);

        var right = this.target.getRightVector();


        vec3.add(pos,pos,forward);
        vec3.add(pos,pos,[0,5,0]);
        return pos;
    };

    this.getFront = function(){
        return this.target.getForwardVector();
    };
    this.getLeft = function(){
        var left = this.target.getForwardVector();
        mathUtils.rotateVec3(left,[0,Math.PI/3,0]);
        return left;
    };
    this.getRight = function(){
        var right= this.target.getForwardVector();
        mathUtils.rotateVec3(right,[0,-Math.PI/3,0]);
        return right;
    };

};