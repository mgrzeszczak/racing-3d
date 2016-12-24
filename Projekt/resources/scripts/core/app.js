var app = (function(){

    var container, stats;
    var camera, scene, renderer;
    var character;

    //https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/

    function initialize(){
        stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
        container = document.createElement( 'div' );
        document.body.appendChild( container );
        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.y = 400;
        scene = new THREE.Scene();
        var light, object;
        scene.add( new THREE.AmbientLight( 0x404040 ) );
        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 1, 0 );
        scene.add( light );
        var map = new THREE.TextureLoader().load( 'resources/textures/UV_Grid_Sm.jpg' );
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        var material = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
        //
        object = new THREE.Mesh( new THREE.SphereGeometry( 75, 20, 10 ), material );
        object.position.set( -400, 0, 200 );
        scene.add( object );
        object = new THREE.Mesh( new THREE.IcosahedronGeometry( 75, 1 ), material );
        object.position.set( -200, 0, 200 );
        scene.add( object );
        object = new THREE.Mesh( new THREE.OctahedronGeometry( 75, 2 ), material );
        object.position.set( 0, 0, 200 );
        scene.add( object );
        object = new THREE.Mesh( new THREE.TetrahedronGeometry( 75, 0 ), material );
        object.position.set( 200, 0, 200 );
        scene.add( object );
        //
        object = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ), material );
        object.position.set( -400, 0, 0 );
        scene.add( object );
        /*object = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 ), material );
        object.position.set( -200, 0, 0 );
        scene.add( object );*/
        object = new THREE.Mesh( new THREE.CircleGeometry( 50, 20, 0, Math.PI * 2 ), material );
        object.position.set( 0, 0, 0 );
        scene.add( object );
        object = new THREE.Mesh( new THREE.RingGeometry( 10, 50, 20, 5, 0, Math.PI * 2 ), material );
        object.position.set( 200, 0, 0 );
        scene.add( object );
        object = new THREE.Mesh( new THREE.CylinderGeometry( 25, 75, 100, 40, 5 ), material );
        object.position.set( 400, 0, 0 );
        scene.add( object );
        //
        var points = [];
        for ( var i = 0; i < 50; i ++ ) {
            points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * Math.sin( i * 0.1 ) * 15 + 50, ( i - 5 ) * 2 ) );
        }
        object = new THREE.Mesh( new THREE.LatheGeometry( points, 20 ), material );
        object.position.set( -400, 0, -200 );
        scene.add( object );
        object = new THREE.Mesh( new THREE.TorusGeometry( 50, 20, 20, 20 ), material );
        object.position.set( -200, 0, -200 );
        scene.add( object );
        object = new THREE.Mesh( new THREE.TorusKnotGeometry( 50, 10, 50, 20 ), material );
        object.position.set( 0, 0, -200 );
        scene.add( object );
        object = new THREE.AxisHelper( 50 );
        object.position.set( 200, 0, -200 );
        scene.add( object );
        object = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ), 50 );
        object.position.set( 400, 0, -200 );
        scene.add( object );

        character = buildCharacter();
        scene.add(character);

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        registerCallbacks();
        requestAnimationFrame(renderLoop);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function renderLoop(){
        stats.begin();
        render();
        stats.end();
        requestAnimationFrame(renderLoop);
    }


    function render() {
        var timer = Date.now() * 0.0001;
        camera.position.x = Math.cos( timer ) * 800;
        camera.position.z = Math.sin( timer ) * 800;
        camera.lookAt( scene.position );
        for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
            var object = scene.children[ i ];
            object.rotation.x = timer * 5;
            object.rotation.y = timer * 2.5;
        }
        character.material.uniforms.color.value = 0.5+0.5*Math.cos(
                new Date().getTime()/1000.0 * Math.PI);
        renderer.render( scene, camera );
    }

    function onKeyDown(event){
        switch (event.key){
            case ' ':
                break;
        }
    }

    var buildCharacter = (function() {
        var _geo = null;

        // Share the same geometry across all planar objects
        function getPlaneGeometry() {
            if(_geo == null) {
                //_geo = new THREE.PlaneGeometry(0.2, 1.0);
                _geo = new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 );
            }

            return _geo;
        }

        return function() {
            var g = getPlaneGeometry();
            var mat = new THREE.ShaderMaterial({
                uniforms: {
                    color: {type: 'f', value: 0.0}
                },
                vertexShader: document.
                getElementById('vertShader').text,
                fragmentShader: document.
                getElementById('fragShader').text,
                side: THREE.DoubleSide
            });

            var obj = new THREE.Mesh(g, mat);
            obj.position.set( -200, 0, 0 );
            return obj;
        }
    })();

    function registerCallbacks(){
        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener('keydown',onKeyDown,true);
    }

    return {
        initialize: initialize
    }

})();