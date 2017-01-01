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

    function initShaders(gl){
        var basicVertexShader, phongVertexShader, blinnVertexShader;
        var phongFragmentShader, basicFragmentShader, blinnFragmentShader;
        loadTextResource('resources/shaders/basic-vertex-shader.glsl',function(text){basicVertexShader=text;});
        loadTextResource('resources/shaders/basic-fragment-shader.glsl',function(text){basicFragmentShader=text;});
        loadTextResource('resources/shaders/gouraud-phong-vertex-shader.glsl',function(text){phongVertexShader=text;});
        loadTextResource('resources/shaders/gouraud-blinn-vertex-shader.glsl',function(text){blinnVertexShader=text;});
        loadTextResource('resources/shaders/blinn-fragment-shader.glsl',function(text){blinnFragmentShader=text;});
        loadTextResource('resources/shaders/phong-fragment-shader.glsl',function(text){phongFragmentShader=text;});

        shaderPrograms[app.shading.GOURAUD*3+app.lighting.PHONG] = createShaderProgram(gl,phongVertexShader,basicFragmentShader);
        shaderPrograms[app.shading.GOURAUD*3+app.lighting.BLINN] = createShaderProgram(gl,blinnVertexShader,basicFragmentShader);

        shaderPrograms[app.shading.FLAT*3+app.lighting.PHONG] = createShaderProgram(gl,phongVertexShader,basicFragmentShader);
        shaderPrograms[app.shading.FLAT*3+app.lighting.BLINN] = createShaderProgram(gl,blinnVertexShader,basicFragmentShader);

        shaderPrograms[app.shading.PHONG*3+app.lighting.PHONG] = createShaderProgram(gl,basicVertexShader,phongFragmentShader);
        shaderPrograms[app.shading.PHONG*3+app.lighting.BLINN] = createShaderProgram(gl,basicVertexShader,blinnFragmentShader);

        var terrainVertexShader, terrainFragmentShader;
        loadTextResource('resources/shaders/terrain/terrain-vertex-shader.glsl',function(text){terrainVertexShader=text;});
        loadTextResource('resources/shaders/terrain/terrain-fragment-shader.glsl',function(text){terrainFragmentShader=text;});
        shaderPrograms['terrain'] = createShaderProgram(gl,terrainVertexShader,terrainFragmentShader);
    }

    function getTerrainShader(){
        return shaderPrograms['terrain'];
    }

    function getShaderProgram(shading,lighting){
        return shaderPrograms[shading*3+lighting];
    }

    return {
        createShaderProgram : createShaderProgram,
        initShaders : initShaders,
        getShaderProgram : getShaderProgram,
        getTerrainShader : getTerrainShader
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