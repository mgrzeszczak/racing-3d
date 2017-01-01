var app = (function(){

    var performanceMonitor;
    var canvas;
    var gl;
    var shaderProgram;

    var car, camera, light, world;

    function initialize(){
        initGL();
        initPerformanceMonitor();
        initShaders();
        initObjects();
        onResize();
        registerCallbacks();
        requestAnimationFrame(renderLoop);
    }

    function initObjects(){
        var model = app.modelLoader.loadModel('resources/models/car.json',gl,shaderProgram);
        car = new app.objects.object([0,0,0],model);
        camera = new app.objects.camera([0,5,-5],[0,0,0]);
        light = new app.objects.light([0,5,0],[1.0,1.0,1.0],[0.1,0.1,0.1]);
        world = new app.objects.world(light,[],camera,mat4.create());
    }

    function initShaders(){
        app.shaderLoader.initShaders(gl);
        /*var vertexShaderText = null;
        var fragmentShaderText = null;
        loadTextResource('resources/shaders/vertexShader.glsl',function(data){
            vertexShaderText = data;
        });
        loadTextResource('resources/shaders/fragmentShader.glsl',function(data){
            fragmentShaderText = data;
        });
        shaderProgram = app.shaderLoader.createShaderProgram(gl,vertexShaderText,fragmentShaderText);*/
        shaderProgram = app.shaderLoader.getShaderProgram(app.shading.GOURAUD,app.lighting.PHONG);
        gl.useProgram(shaderProgram);
    }

    function initGL(){
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
    }

    function renderLoop(){
        performanceMonitor.begin();
        updateUniforms();
        render();
        performanceMonitor.end();
        requestAnimationFrame(renderLoop);
    }

    function render() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        car.update();
        car.render(gl,shaderProgram);
    }

    function updateUniforms(){
        var ambientUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_AMBIENT);
        var lightColorUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_LIGHT_COLOR);
        var lightPosUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_LIGHT_POSITION);
        var viewMatrixUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_VIEW_MATRIX);
        var projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_PROJECTION_MATRIX);
        var cameraPositionUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_CAMERA_POSITION);

        gl.uniform3fv(ambientUniformLocation,light.ambient);
        gl.uniform3fv(lightColorUniformLocation,light.color);
        gl.uniform3fv(lightPosUniformLocation,light.position);

        gl.uniform3fv(cameraPositionUniformLocation,camera.position);

        mat4.perspective(world.projectionMatrix,glMatrix.toRadian(45),canvas.width/canvas.height,0.1,1000.0);

        gl.uniformMatrix4fv(viewMatrixUniformLocation,false,camera.getViewMatrix());
        gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,world.projectionMatrix);
    }

    function initPerformanceMonitor(){
        performanceMonitor = new Stats();
        performanceMonitor.showPanel(0);
        document.body.appendChild(performanceMonitor.dom);
        var container = document.createElement( 'div' );
        document.body.appendChild( container );
    }

    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0,0,canvas.width,canvas.height);
    }

    function onKeyDown(event){
        console.log(event);
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
        initialize: initialize,
        useShader : function(shader){
            shaderProgram = shader;
            gl.useProgram(shader);
        }
    }

})();