var app = (function(){

    var performanceMonitor;
    var canvas;
    var gl;
    var shaderProgram;

    var car, camera, light, world;
    var terrain;

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
        terrain = app.terrainLoader.generateTerrainFromImage(gl,document.getElementById('terrain'),3,3,'terrain2');
        var model = app.modelLoader.loadModel('resources/models/f1.json',gl,'formula-body');

        var wheel = app.modelLoader.loadModel('resources/models/wheel.json',gl,'formula-wheel');
        console.log(wheel.model);

        model.model.wheeloffset.fl[2]-=0.4;
        model.model.wheeloffset.fr[2]-=0.4;
        model.model.wheeloffset.rl[2]-=0.4;
        model.model.wheeloffset.rr[2]-=0.4;

        car = new app.objects.object([0,0,0],model,wheel);
        camera = new app.objects.camera([0,5,-5],[0,0,0]);
        camera.setTarget(car);
        //camera.followTarget(car);
        light = new app.objects.light([0,5,0],[1.0,1.0,1.0],[0.01,0.01,0.01]);
        world = new app.objects.world(light,[],camera,mat4.create());
    }

    function initShaders(){
        app.shaderLoader.initShaders(gl);
        shaderProgram = app.shaderLoader.getShaderProgram(app.shading.PHONG,app.lighting.PHONG);
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

    var renderLoop = (function(){
        var prevTime = 0;
        return function(currTime){
            var deltaTime = currTime - prevTime;
            prevTime = currTime;
            update(deltaTime);
            performanceMonitor.begin();
            render();
            performanceMonitor.end();
            requestAnimationFrame(renderLoop);
        }
    })();

    function update(deltaTime){
        car.update(deltaTime);
        camera.update(deltaTime);
    }

    function render() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        /*gl.useProgram(app.shaderLoader.getTerrainShader());
        var terrainShader = app.shaderLoader.getTerrainShader();
        var viewMatrixUniformLocation = gl.getUniformLocation(terrainShader,app.names.SHADER_VIEW_MATRIX);
        var projectionMatrixUniformLocation = gl.getUniformLocation(terrainShader,app.names.SHADER_PROJECTION_MATRIX);
        var worldMatrixUniformLocation = gl.getUniformLocation(terrainShader,app.names.SHADER_WORLD_MATRIX);
        mat4.perspective(world.projectionMatrix,glMatrix.toRadian(45),canvas.width/canvas.height,0.1,1000.0);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,mat4.create());
        gl.uniformMatrix4fv(viewMatrixUniformLocation,false,camera.getViewMatrix());
        gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,world.projectionMatrix);
        terrain.render(gl,terrainShader);*/


        gl.useProgram(shaderProgram);
        updateUniforms();

        var worldMatrixUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_WORLD_MATRIX);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,mat4.create());
        terrain.render(gl,shaderProgram);
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
        switch (event.key){
            case ' ':
                break;
            case 'w':
                car.setSpeed(0.01);
                break;
            case 's':
                car.setSpeed(-0.01);
                break;
            case 'a':
                car.wheelRotateLeft = true;
                break;
            case 'd':
                car.wheelRotateRight = true;
                break;
        }
    }
    function onKeyUp(event){
        switch (event.key){
            case ' ':
                break;
            case 'w':
                car.setSpeed(0.0);
                break;
            case 's':
                car.setSpeed(0.0);
                break;
            case 'a':
                car.wheelRotateLeft = false;
                break;
            case 'd':
                car.wheelRotateRight = false;
                break;
        }
    }

    function registerCallbacks(){
        window.addEventListener('resize', onResize, false);
        document.addEventListener('keydown',onKeyDown,true);
        document.addEventListener('keyup',onKeyUp,true);
    }

    return {
        initialize: initialize,
        useShader : function(shader){
            shaderProgram = shader;
            gl.useProgram(shader);
        }
    }

})();