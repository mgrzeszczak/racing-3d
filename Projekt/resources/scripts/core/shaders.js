app.shaderLoader = (function(){

    var shaderPrograms = {};

    function createShaderProgram(gl,vertexShaderText,fragmentShaderText){

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader,vertexShaderText);
        gl.shaderSource(fragmentShader,fragmentShaderText);

        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
            console.error('Error compiling vertex shader',gl.getShaderInfoLog(vertexShader));
        }

        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
            console.error('Error compiling fragment shader',gl.getShaderInfoLog(fragmentShader));
        }
        // entire pipeline - combination of both shaders
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram,vertexShader);
        gl.attachShader(shaderProgram,fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){
            console.error('Error linking program!',gl.getProgramInfoLog(shaderProgram));
        }
        // VALIDATION
        gl.validateProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram,gl.VALIDATE_STATUS)){
            console.error('Error validating program',gl.getProgramInfoLog(shaderProgram));
        }
        return shaderProgram;
    }

    function initShaders(){

    }

    function getShaderProgram(shading,lighting){
        switch (shading) {
            case app.shading.FLAT:
                switch (lighting){
                    case app.lighting.PHONG:
                        return '';
                    case app.lighting.BLINN:
                        return '';
                }
                break;
            case app.shading.GOURAUD:
                switch (lighting){
                    case app.lighting.PHONG:
                        return '';
                    case app.lighting.BLINN:
                        return '';
                }
                break;
            case app.shading.PHONG:
                switch (lighting){
                    case app.lighting.PHONG:
                        return '';
                    case app.lighting.BLINN:
                        return '';
                }
                break;
        }
    }

    return {
        createShaderProgram : createShaderProgram,
        initShaders : initShaders,
        getShaderProgram : getShaderProgram
    }

})();

app.shading = {
    FLAT : 1,
    GOURAUD : 2,
    PHONG : 3
};

app.lighting = {
    PHONG : 1,
    BLINN : 2
};