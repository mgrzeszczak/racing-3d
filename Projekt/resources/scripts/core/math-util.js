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

    function rotateVec3(vector,rotation){
        mat4.fromXRotation(workMatrix,rotation[0]);
        vec3.transformMat4(vector,vector,workMatrix);

        mat4.fromYRotation(workMatrix,rotation[1]);
        vec3.transformMat4(vector,vector,workMatrix);

        mat4.fromZRotation(workMatrix,rotation[2]);
        vec3.transformMat4(vector,vector,workMatrix);
    }

    return {
        rotateMat4 : rotateMat4,
        rotateVec3 : rotateVec3
    }

})();