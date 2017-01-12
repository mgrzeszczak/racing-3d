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
    var skybox;
    var city;
    var house;
    var steeringWheel;
    var mirror;

    var basePath;

    var reflectorLights = [];

    var leftMirror;
    var rightMirror;

    function initialize(){
        initGL();
        initPerformanceMonitor();
        initShaders();
        leftMirror = initMirrorSceneBuffers();
        rightMirror = initMirrorSceneBuffers();
        initObjects();
        onResize();
        registerCallbacks();
        requestAnimationFrame(renderLoop);
    }

    function createBot(path){
        var botCar = new app.objects.object([0,0,0],model,wheel,terrain);
        var bot = new app.objects.bot(botCar,path);
        bots.push(bot);

        reflectorLights.push(new app.objects.reflectorLight([1,1,1],[0,0,0],0.01,botCar,[0.8,10,3]));
        reflectorLights.push(new app.objects.reflectorLight([1,1,1],[0,0,0],0.01,botCar,[-0.8,10,3]));
    }

   // var mirrorFrameBuffer;
   // var mirrorTexture;
   // var renderBuffer;

    function initMirrorSceneBuffers(){
        var mirrorFrameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, mirrorFrameBuffer);
        mirrorFrameBuffer.width = 512;
        mirrorFrameBuffer.height = 512;

        var mirrorTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, mirrorTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mirrorFrameBuffer.width, mirrorFrameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, mirrorFrameBuffer.width, mirrorFrameBuffer.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, mirrorTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return [mirrorFrameBuffer,mirrorTexture,renderBuffer];
    }

    function initObjects(){
        terrain = app.terrainLoader.generateTerrainFromImage(gl,document.getElementById('terrain2'),3,3,0,'map');
        model = app.modelLoader.loadModel('resources/models/f1.json',gl,'formula-body');
        wheel = app.modelLoader.loadModel('resources/models/wheel.json',gl,'white');
        city = app.modelLoader.loadModel('resources/models/city.json',gl,'white');
        house = app.modelLoader.loadModel('resources/models/house.json',gl,'house');
        steeringWheel = app.modelLoader.loadModel('resources/models/steering-wheel.json',gl,'steering-wheel');
        mirror = app.modelLoader.loadModel('resources/models/mirror.json',gl,'white');

        var skyboxModel = app.modelLoader.loadModel('resources/models/skybox.json',gl,'sky');

        car = new app.objects.object([0,0,0],model,wheel,terrain);

        skybox = new app.objects.skybox(skyboxModel,car);
        console.log(skybox);

        loadTextResource('/resources/paths/test-path.json',function(data){
           basePath = JSON.parse(data);
        });

        cameras[0] = new app.objects.camera([0,30,-30],[0,0,0]);
        cameras[0].setTarget(car);
        cameras[1] = new app.objects.camera([0,30,-30],[0,0,0]);
        cameras[1].followTarget(car);
        cameras[2] = new app.objects.camera([0,50,-50],[0,0,0]);
        cameras[2].relativeTo(car,[0,0.975,0],-0.475);
        camera = cameras[0];

        reflectorLights.push(new app.objects.reflectorLight([1,1,1],[0,0,0],0.01,car,[0.8,10,3]));
        reflectorLights.push(new app.objects.reflectorLight([1,1,1],[0,0,0],0.01,car,[-0.8,10,3]));

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

/*
            gl.bindFramebuffer(gl.FRAMEBUFFER, mirrorFrameBuffer);
            gl.viewport(0,0,512,512);
            var oldCam = camera;

            var forward = car.getForwardVector();
            var right = car.getRightVector();

            var up = vec3.clone(forward);
            vec3.cross(up,forward,right);
            vec3.scale(up,up,0.75);

            vec3.scale(right,right,1);

            var camPos = vec3.clone(car.position);

            vec3.add(camPos,camPos,right);
            vec3.add(camPos,camPos,up);

            var lookAt = vec3.clone(car.position);
            vec3.scale(forward,forward,-10);
            vec3.add(lookAt,lookAt,forward);


            camera = new app.objects.camera(camPos,lookAt);

            render(false);
            gl.bindTexture(gl.TEXTURE_2D, mirrorTexture);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);*/


            gl.bindFramebuffer(gl.FRAMEBUFFER, leftMirror[0]);
            gl.viewport(0,0,512,512);
            var oldCam = camera;

            var forward = car.getForwardVector();
            var right = car.getRightVector();

            var up = vec3.clone(forward);
            vec3.cross(up,forward,right);
            vec3.scale(up,up,0.75);

            vec3.scale(right,right,1);

            var camPos = vec3.clone(car.position);

            vec3.add(camPos,camPos,right);
            vec3.add(camPos,camPos,up);

            var lookAt = vec3.clone(car.position);
            vec3.scale(forward,forward,-10);
            vec3.add(lookAt,lookAt,forward);


            camera = new app.objects.camera(camPos,lookAt);

            render(false);
            gl.bindTexture(gl.TEXTURE_2D, leftMirror[1]);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);


            gl.bindFramebuffer(gl.FRAMEBUFFER, rightMirror[0]);
            gl.viewport(0,0,512,512);


            var forward = car.getForwardVector();
            var right = car.getRightVector();

            var up = vec3.clone(forward);
            vec3.cross(up,forward,right);
            vec3.scale(up,up,0.75);

            vec3.scale(right,right,-1);

            var camPos = vec3.clone(car.position);

            vec3.add(camPos,camPos,right);
            vec3.add(camPos,camPos,up);

            var lookAt = vec3.clone(car.position);
            vec3.scale(forward,forward,-10);
            vec3.add(lookAt,lookAt,forward);


            camera = new app.objects.camera(camPos,lookAt);

            render(false);
            gl.bindTexture(gl.TEXTURE_2D, rightMirror[1]);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);


            gl.viewport(0,0,canvas.width,canvas.height);
            camera = oldCam;
            render(true);



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

    function render(drawMirror) {
        shaderProgram = app.shaderLoader.getShaderProgram(shading,lighting);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        gl.disable(gl.DEPTH_TEST);
        var staticShader = app.shaderLoader.getStaticShader();
        gl.useProgram(staticShader);
        gl.enable(gl.DEPTH_TEST);

        var viewMatrixUniformLocation = gl.getUniformLocation(staticShader,app.names.SHADER_VIEW_MATRIX);
        var projectionMatrixUniformLocation = gl.getUniformLocation(staticShader,app.names.SHADER_PROJECTION_MATRIX);
        var cameraPositionUniformLocation = gl.getUniformLocation(staticShader,app.names.SHADER_CAMERA_POSITION);

        gl.uniform3fv(cameraPositionUniformLocation,camera.position);
        mat4.perspective(world.projectionMatrix,glMatrix.toRadian(45),canvas.width/canvas.height,0.1,1000.0);
        gl.uniformMatrix4fv(viewMatrixUniformLocation,false,camera.getViewMatrix());
        gl.uniformMatrix4fv(projectionMatrixUniformLocation,false,world.projectionMatrix);

        skybox.render(gl,shaderProgram);





        gl.useProgram(shaderProgram);
        updateUniforms();



        var worldMatrixUniformLocation = gl.getUniformLocation(shaderProgram,app.names.SHADER_WORLD_MATRIX);
        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,mat4.create());
        setMaterialUniforms(0.0,1.0);
        terrain.render(gl,shaderProgram);

        setMaterialUniforms(1.0,1.0);
        house.render(gl,shaderProgram);

        setMaterialUniforms(1.0,1.0);
        updateUniforms();

        car.render(gl,shaderProgram);

        //gl.cullFace(gl.FRONT);
        bots.forEach(function(bot){
            bot.render(gl,shaderProgram);
        });
        //gl.cullFace(gl.BACK);

        if (drawMirror === false) return;

        ///// MIRRRORS

        gl.useProgram(staticShader);
        var worldMatrixUniformLocation = gl.getUniformLocation(staticShader,app.names.SHADER_WORLD_MATRIX);

        var worldMatrix = mat4.create();
        var workMatrix = mat4.create();
        var rotation = car.rotation;
        var position = car.position;


        mat4.identity(worldMatrix);
        mat4.fromScaling(worldMatrix,[5,5,5]);

        mathUtils.rotateCurrMat4(workMatrix,[0,-Math.PI/12,Math.PI]);
        mat4.multiply(worldMatrix,workMatrix,worldMatrix);

        mat4.fromTranslation(workMatrix,[1.8,0.3,2]);
        mat4.multiply(worldMatrix,workMatrix,worldMatrix);

        mathUtils.rotateMat4(workMatrix,rotation);
        mat4.multiply(worldMatrix,workMatrix,worldMatrix);

        mat4.fromTranslation(workMatrix,position);
        mat4.multiply(worldMatrix,workMatrix,worldMatrix);

        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,worldMatrix);
        mirror.renderWithTexture(gl,staticShader,leftMirror[1]);

        var worldMatrix = mat4.create();
        var workMatrix = mat4.create();
        var rotation = car.rotation;
        var position = car.position;


        mat4.identity(worldMatrix);
        mat4.fromScaling(worldMatrix,[5,5,5]);

        mathUtils.rotateCurrMat4(workMatrix,[0,Math.PI/12,Math.PI]);
        mat4.multiply(worldMatrix,workMatrix,worldMatrix);

        mat4.fromTranslation(workMatrix,[-1.8,0.3,2]);
        mat4.multiply(worldMatrix,workMatrix,worldMatrix);

        mathUtils.rotateMat4(workMatrix,rotation);
        mat4.multiply(worldMatrix,workMatrix,worldMatrix);

        mat4.fromTranslation(workMatrix,position);
        mat4.multiply(worldMatrix,workMatrix,worldMatrix);

        gl.uniformMatrix4fv(worldMatrixUniformLocation,false,worldMatrix);
        mirror.renderWithTexture(gl,staticShader,rightMirror[1]);
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

        updateReflectorLightInformation();
    }

    function updateReflectorLightInformation(){
        var reflectorLightCountLocation = gl.getUniformLocation(shaderProgram, "lightCount");
        //console.log(reflectorLights.length);
        gl.uniform1i(reflectorLightCountLocation,2);

        for (var i=0;i<100&&i<reflectorLights.length;i++){
            var positionLocation = gl.getUniformLocation(shaderProgram, "reflectorLights["+i+"].position");
            var colorLocation  = gl.getUniformLocation(shaderProgram, "reflectorLights["+i+"].color");
            var ambientLocation  = gl.getUniformLocation(shaderProgram, "reflectorLights["+i+"].ambient");
            var frontLocation  = gl.getUniformLocation(shaderProgram, "reflectorLights["+i+"].front");
            var leftLocation  = gl.getUniformLocation(shaderProgram, "reflectorLights["+i+"].left");
            var rightLocation  = gl.getUniformLocation(shaderProgram, "reflectorLights["+i+"].right");
            var attenuationLocation  = gl.getUniformLocation(shaderProgram, "reflectorLights["+i+"].attenuation");


            //console.log(reflectorLights[i].getPosition());
            //console.log(reflectorLights[i].getFront());

            gl.uniform3fv(positionLocation,reflectorLights[i].getPosition());
            gl.uniform3fv(colorLocation,reflectorLights[i].color);
            gl.uniform3fv(ambientLocation,reflectorLights[i].ambient);
            gl.uniform3fv(frontLocation,reflectorLights[i].getFront());
            gl.uniform3fv(leftLocation,reflectorLights[i].getLeft());
            gl.uniform3fv(rightLocation,reflectorLights[i].getRight());

            gl.uniform1f(attenuationLocation,reflectorLights[i].attenuation);
        }

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
        //console.log(event);
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