var app = (function(){

    var performanceMonitor;
    var canvas;
    var gl;
    var shaderProgram;

    var car, camera, light, world;
    var terrain;

    var cameras = [];

    var lighting;
    var shading;


    var bots = [];

    var carData = [];
    var record = false;

    var model;
    var wheel;
    var basePath;

    function initialize(){
        initGL();
        initPerformanceMonitor();
        initShaders();
        initObjects();
        onResize();
        registerCallbacks();
        requestAnimationFrame(renderLoop);
    }

    function createBot(path){
        var botCar = new app.objects.object([0,0,0],model,wheel,terrain);
        var bot = new app.objects.bot(botCar,path);
        bots.push(bot);
    }

    function initObjects(){
        terrain = app.terrainLoader.generateTerrainFromImage(gl,document.getElementById('terrain2'),3,3,0,'map');
        model = app.modelLoader.loadModel('resources/models/f1.json',gl,'formula-body');
        wheel = app.modelLoader.loadModel('resources/models/wheel.json',gl,'white');

        car = new app.objects.object([0,0,0],model,wheel,terrain);

        loadTextResource('/resources/paths/test-path.json',function(data){
           basePath = JSON.parse(data);
        });

        cameras[0] = new app.objects.camera([0,30,-30],[0,0,0]);
        cameras[0].setTarget(car);
        cameras[1] = new app.objects.camera([0,30,-30],[0,0,0]);
        cameras[1].followTarget(car);
        cameras[2] = new app.objects.camera([0,50,-50],[0,0,0]);
        camera = cameras[0];

        light = new app.objects.light([0,200,0],[1.0,1.0,1.0],[0.01,0.01,0.01]);
        world = new app.objects.world(light,[],camera,mat4.create());
    }

    function initShaders(){
        app.shaderLoader.initShaders(gl);
        lighting = app.lighting.PHONG;
        shading = app.shading.PHONG;
        shaderProgram = app.shaderLoader.getShaderProgram(shading,lighting);
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
        bots.forEach(function(bot){
            bot.update(deltaTime);
        });
        recordData(car);
        cameras.forEach(function(camera){
            camera.update(deltaTime);
        });
    }

    function render() {
        shaderProgram = app.shaderLoader.getShaderProgram(shading,lighting);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(shaderProgram);
        updateUniforms();

        var worldMatrixUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_WORLD_MATRIX);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,mat4.create());
        setMaterialUniforms(0.0,1.0);
        terrain.render(gl,shaderProgram);

        setMaterialUniforms(1.0,1.0);
        updateUniforms();
        car.render(gl,shaderProgram);
        bots.forEach(function(bot){
            bot.render(gl,shaderProgram);
        });
    }

    function setMaterialUniforms(material_ks,material_kd){
        var materialKsUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_UNIFORM_MATERIAL_KS);
        var materialKdUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_UNIFORM_MATERIAL_KD);

        gl.uniform1f(materialKsUniformLocation,material_ks);
        gl.uniform1f(materialKdUniformLocation,material_kd);
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

    function toggleRecording(){
        record = !record;
        if (record === false) {
            createBot(carData);
            console.log(JSON.stringify(carData));
            carData = [];
            //console.log(carData);
        }
        else carData = [];
    }

    var recordData = (function(){
        var counter = 0;
        var step = 5;

        return function(object){
            counter++;
            if (counter%step===0){
                counter = 0;
                carData.push(object.getMomentaryData());
            }
        }

    })();

    function onKeyDown(event){
        console.log(event);
        switch (event.key){
            case '1':
                camera = cameras[0];
                break;
            case '2':
                camera = cameras[1];
                break;
            case '3':
                camera = cameras[2];
                break;
            case 'b':
                lighting = app.lighting.BLINN;
                break;
            case 'p':
                lighting = app.lighting.PHONG;
                break;
            case '8':
                shading = app.shading.FLAT;
                app.settings.FLAT_SHADING = true;
                break;
            case '9':
                shading = app.shading.GOURAUD;
                app.settings.FLAT_SHADING = false;
                break;
            case '0':
                shading = app.shading.PHONG;
                app.settings.FLAT_SHADING = false;
                break;
            case 'w':
                car.accelerate = true;
                break;
            case 's':
                car.break = true;
                break;
            case 'a':
                car.wheelRotateLeft = true;
                break;
            case 'd':
                car.wheelRotateRight = true;
                break;
            case 'Enter':
                toggleRecording();
                break;
            case 'm':
                createBot(basePath);
                break;
        }
        return true;
    }

    function onKeyUp(event){
        switch (event.key){
            case 'w':
                car.accelerate = false;
                break;
            case 's':
                car.break = false;
                break;
            case 'a':
                car.wheelRotateLeft = false;
                break;
            case 'd':
                car.wheelRotateRight = false;
                break;
        }
        return true;
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