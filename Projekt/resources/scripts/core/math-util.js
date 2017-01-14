var mathUtils = (function(){

    var workMatrix = mat4.create();

    function rotateMat4(matrix,rotation){
        mat4.identity(matrix);

        mat4.fromXRotation(workMatrix,rotation[0]);
        mat4.multiply(matrix,workMatrix,matrix);

        mat4.fromYRotation(workMatrix,rotation[1]);
        mat4.multiply(matrix,workMatrix,matrix);

        mat4.fromZRotation(workMatrix,rotation[2]);
        mat4.multiply(matrix,workMatrix,matrix);
    }

    function rotateCurrMat4(matrix,rotation){

        mat4.fromXRotation(workMatrix,rotation[0]);
        mat4.multiply(matrix,workMatrix,matrix);

        mat4.fromYRotation(workMatrix,rotation[1]);
        mat4.multiply(matrix,workMatrix,matrix);

        mat4.fromZRotation(workMatrix,rotation[2]);
        mat4.multiply(matrix,workMatrix,matrix);
    }

    function rotateVec3(vector,rotation){
        mat4.fromXRotation(workMatrix,rotation[0]);
        vec3.transformMat4(vector,vector,workMatrix);

        mat4.fromYRotation(workMatrix,rotation[1]);
        vec3.transformMat4(vector,vector,workMatrix);

        mat4.fromZRotation(workMatrix,rotation[2]);
        vec3.transformMat4(vector,vector,workMatrix);
    }

    function distance2d(x1,y1,x2,y2){
        var dx = x1-x2;
        var dy = y1-y2;

        return Math.sqrt(dx*dx+dy*dy);
    }


    function worldMatrix(translation,rotation,scaling){
        var worldMat = mat4.create();
        mat4.fromScaling(worldMat,scaling);
        rotateCurrMat4(worldMat,rotation);
        mat4.fromTranslation(workMatrix,translation);
        mat4.multiply(worldMat,workMatrix,worldMat);
        return worldMat;
    }

    return {
        rotateMat4 : rotateMat4,
        rotateCurrMat4 : rotateCurrMat4,
        rotateVec3 : rotateVec3,
        distance2d : distance2d,
        worldMatrix : worldMatrix
    }

})();