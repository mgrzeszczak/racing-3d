app.shaders = {

    vertexShaderText :
        [
            'precision mediump float;',
            '',
            'attribute vec3 vertPosition;',
            '//attribute vec3 vertColor;',
            'attribute vec3 inNormal;',
            'varying vec3 outNormal;',
            'varying vec3 fragColor;',
            'uniform mat4 worldMatrix;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            '',
            'void main()',
            '{',
            '  outNormal = inNormal;',
            '  vec3 ambient = vec3(0.1, 0.1, 0.1);',
            '  vec3 color = vec3(1.0, 1.0, 1.0) * min((max(dot(normalize(outNormal), vec3(0.0,1.0,0.0)), 0.0) + ambient),1.0);',
            '  fragColor = color;',
            '  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertPosition, 1.0);',
            '}'
        ].join('\n'),

    fragmentShaderText :
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'varying vec3 outNormal;',
        'void main()',
        '{',
        '  //vec3 ambient = vec3(0.1, 0.1, 0.1);',
        '  //vec3 color = vec3(1.0, 1.0, 1.0) * min((max(dot(normalize(outNormal), vec3(0.0,1.0,0.0)), 0.0) + ambient),1.0);',
        '  vec3 color = fragColor;',
        '  gl_FragColor = vec4(color, 1.0);',
        '}'
    ].join('\n')

};

app.shaderLoader = (function(){
    function createShaderProgram(gl,vertexShaderText,fragmentShaderText){
        //vertexShaderText = document.getElementById('vertexShader').text;
        //fragmentShaderText = document.getElementById('fragmentShader').text;

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

    return {
        createShaderProgram : createShaderProgram
    }
})();