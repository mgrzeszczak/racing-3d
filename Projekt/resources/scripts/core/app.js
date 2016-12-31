var app = (function(){

	var vertexShaderText =
        [
            'precision mediump float;',
            '',
            'attribute vec3 vertPosition;',
            'attribute vec3 vertColor;',
            'varying vec3 fragColor;',

            'uniform mat4 worldMatrix;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            '',
            'void main()',
            '{',
            '  fragColor = vertColor;',
            '  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertPosition, 1.0);',
            '}'
        ].join('\n');

    var fragmentShaderText =
        [
            'precision mediump float;',
            '',
            'varying vec3 fragColor;',
            'void main()',
            '{',
            '  gl_FragColor = vec4(fragColor, 1.0);',
            '}'
        ].join('\n');

    var stats;
    var container;
    var canvas;
    var gl;
    var angle;
    var identityMatrix;
    var worldMatrixUniformLocation;
    var worldMatrix;
    var shaderProgram;
    var boxIndices;

    function initialize(){
        canvas = app.content.canvas;
        gl = canvas.getContext('webgl')
            || canvas.getContext('experimental-webgl')
            || canvas.getContext('moz-webgl')
            || canvas.getContext('webkit-3d');
        if (!gl) {
            alert('Your browser does not support WebGL.');
            return;
        }
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        //onResize();
        initStats();
        createShaders();

        //registerCallbacks();
        angle = 0;
        identityMatrix = new Float32Array(16);
        mat4.identity(identityMatrix);
        createBox();
        requestAnimationFrame(renderLoop);
    }

    function createBox(){

        var boxVertices =
            [ // X, Y, Z           R, G, B
                // Top
                -1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
                -1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
                1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
                1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

                // Left
                -1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
                -1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
                -1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
                -1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

                // Right
                1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
                1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
                1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
                1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

                // Front
                1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
                1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
                -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
                -1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

                // Back
                1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
                1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
                -1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
                -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

                // Bottom
                -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
                -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
                1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
                1.0, -1.0, -1.0,    0.5, 0.5, 1.0
            ];

        boxIndices =
            [
                // Top
                0, 1, 2,
                0, 2, 3,

                // Left
                5, 4, 6,
                6, 4, 7,

                // Right
                8, 9, 10,
                8, 10, 11,

                // Front
                13, 12, 14,
                15, 14, 12,

                // Back
                16, 17, 18,
                16, 18, 19,

                // Bottom
                21, 20, 22,
                22, 20, 23
            ];

        console.log(boxIndices);

        var boxVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

        var boxIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

        console.log(boxIndexBufferObject);

        var positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
        var vertColorAttributeLocation = gl.getAttribLocation(shaderProgram, 'vertColor');

        gl.vertexAttribPointer(
            positionAttributeLocation, // attrib location
            3, // number of elements per attrib
            gl.FLOAT, // type
            false, // normalized ?
            6 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
            0  // offset from the beginning
        );

        gl.vertexAttribPointer(
            vertColorAttributeLocation, // attrib location
            3, // number of elements per attrib
            gl.FLOAT, // type
            false, // normalized ?
            6 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
            3 * Float32Array.BYTES_PER_ELEMENT  // offset from the beginning
        );

        // enable attribute
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.enableVertexAttribArray(vertColorAttributeLocation);

        gl.useProgram(shaderProgram);

        // uniforms
        worldMatrixUniformLocation = gl.getUniformLocation(shaderProgram,'worldMatrix');
        var viewMatrixUniformLocation = gl.getUniformLocation(shaderProgram,'viewMatrix');
        var projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram,'projectionMatrix');

        var projectionMatrix = new Float32Array(16);
        worldMatrix = new Float32Array(16); // world position of the object
        var viewMatrix = new Float32Array(16); // camera

        mat4.identity(worldMatrix);
        mat4.lookAt(viewMatrix,[0, 0, -10],[0, 0, 0],[0, 1, 0]); // y is up
        mat4.perspective(projectionMatrix,glMatrix.toRadian(45),canvas.width/canvas.height,0.1,1000.0);

        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,worldMatrix);
        gl.uniformMatrix4fv(viewMatrixUniformLocation,false,viewMatrix);
        gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);
    }

    function createScene(){

        var triangleVertices = [
            // X, Y, Z     R, G, B
            0.0, 0.5, 0.0,  1.0, 0.0, 0.0,
            -0.5, -0.5, 0.0, 0.0,1.0,0.0,
            0.5,-0.5, 0.0,  0.0,0.0,1.0
        ];

        // VERTEX BUFFER OBJECT
        var triangleVBO = gl.createBuffer();
        // SET ACTIVE BUFFER
        gl.bindBuffer(gl.ARRAY_BUFFER,triangleVBO);
        // SET BUFFER DATA, WE NEED 32 BIT FLOATS
        // STATIC - FROM CPU TO GPU ONCE, WONT BE CHANGED
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices) ,gl.STATIC_DRAW);

        var positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
        var vertColorAttributeLocation = gl.getAttribLocation(shaderProgram, 'vertColor');

        gl.vertexAttribPointer(
            positionAttributeLocation, // attrib location
            3, // number of elements per attrib
            gl.FLOAT, // type
            false, // normalized ?
            6 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
            0  // offset from the beginning
        );

        gl.vertexAttribPointer(
            vertColorAttributeLocation, // attrib location
            3, // number of elements per attrib
            gl.FLOAT, // type
            false, // normalized ?
            6 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
            3 * Float32Array.BYTES_PER_ELEMENT  // offset from the beginning
        );

        // enable attribute
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.enableVertexAttribArray(vertColorAttributeLocation);

        gl.useProgram(shaderProgram);

        // uniforms
        worldMatrixUniformLocation = gl.getUniformLocation(shaderProgram,'worldMatrix');
        var viewMatrixUniformLocation = gl.getUniformLocation(shaderProgram,'viewMatrix');
        var projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram,'projectionMatrix');

        var projectionMatrix = new Float32Array(16);
        worldMatrix = new Float32Array(16); // world position of the object
        var viewMatrix = new Float32Array(16); // camera

        mat4.identity(worldMatrix);
        //mat4.identity(viewMatrix);
        // lookAt
        // matrix, cameraPosition, positionCameraLooksAt, worldUp position
        mat4.lookAt(viewMatrix,[0, 0, -10],[0, 0, 0],[0, 1, 0]); // y is up
        mat4.perspective(projectionMatrix,glMatrix.toRadian(45),canvas.width/canvas.height,0.1,1000.0);

        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,worldMatrix);
        gl.uniformMatrix4fv(viewMatrixUniformLocation,false,viewMatrix);
        gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,projectionMatrix);

        //gl.drawArrays(gl.TRIANGLES, 0 ,3);// how many skip,how manny draw
    }

    function createShaders(){
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
        shaderProgram = gl.createProgram();
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
    }

    function initStats(){
        stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
        container = document.createElement( 'div' );
        document.body.appendChild( container );
    }

    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        console.log(gl);
    }

    function renderLoop(){
        stats.begin();
        render();
        stats.end();
        requestAnimationFrame(renderLoop);
    }

    function render() {
        // rotate and update world matrix
        angle = performance.now()/1000 / 6*2*Math.PI;

        mat4.rotate(worldMatrix,identityMatrix,angle,[1,1,1]);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,worldMatrix);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //gl.drawArrays(gl.TRIANGLES, 0 ,3);// how many skip,how manny draw
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT,0);
    }

    function onKeyDown(event){
        switch (event.key){
            case ' ':
                break;
        }
    }

    function registerCallbacks(){
        window.addEventListener('resize', onResize, false);
        document.addEventListener('keydown',onKeyDown,true);
    }

    return {
        initialize: initialize
    }

})();