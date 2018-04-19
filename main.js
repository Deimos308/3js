var  scene, camera, renderer, mesh;

/**objects**/
var crate, crateTexture, crateNormalMap, crateBumpMap;
var meshFloor, ambientLight, light;
var sky;
var objects = [];

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

/**controls**/
var controls;
var raycaster;

var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();

var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02 };

function init(){
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
    configControls(controls);

//Sky

    var loader = new THREE.TextureLoader();
    loader.load('textures/sky2-texture.jpg', function(texture){
        sky = new THREE.Mesh(
            new THREE.SphereGeometry(550, 100, 50),
                new THREE.MeshPhongMaterial({map: texture, side: THREE.BackSide})
        );
        scene.add(sky);
        //objects.push(sky);
    });
    // cube



 //Floooooooor

    var loader = new THREE.TextureLoader();
    loader.load('textures/soil-texture.jpg', function(texture){
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 75, 75 );
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(1000, 1000, 100, 100),
		new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide})
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);
    objects.push(meshFloor);
    });

	
	ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
	scene.add(ambientLight);
	
	light = new THREE.PointLight(0xffffff, 10, 10);
	light.position.set(-3,6,-3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);


    var textureLoader = new THREE.TextureLoader();
    crateTexture = textureLoader.load("crate0/crate0_diffuse.jpg");
    crateBumpMap = textureLoader.load("crate0/crate0_bump.jpg");
    crateNormalMap = textureLoader.load("crate0/crate0_normal.jpg");

    crate = new THREE.Mesh(
        new THREE.BoxGeometry(3,3,3),
        new THREE.MeshPhongMaterial({
            color:0xffffff,
            map:crateTexture,
            bumpMap:crateBumpMap,
            normalMap:crateNormalMap
        })
    );
    crate.scale.set(2.5,2.5,2.5)
    scene.add(crate);
    crate.position.set(5, 4, 5);
    crate.receiveShadow = true;
    crate.castShadow = true;


    // Model/material loading!
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.load("models/Tent_Poles_01.mtl", function(materials){
		
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		
		objLoader.load("models/Tent_Poles_01.obj", function(tent){
		
			tent.traverse(function(node){
				if( node instanceof THREE.Mesh ){
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});
            tent.scale.set(5,5,5);
            tent.position.set(-15, 0, 10);
            tent.rotation.y = -Math.PI/4;
            scene.add(tent);
		});
		
	});
	
	
	camera.position.y = player.height;
	camera.lookAt(new THREE.Vector3(0,player.height,0));

    //
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    document.body.appendChild( renderer.domElement );
    //

    //
    window.addEventListener( 'resize', onWindowResize, false );

	
	animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function updateUI() {

}

function animate(){
	requestAnimationFrame(animate);
	crate.rotation.y += 0.01;

	/**Controls setings**/
    if ( controlsEnabled ) {
        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;
        var intersections = raycaster.intersectObjects( objects );
        var isOnObject = intersections.length > 0;
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        if ( moveForward ) velocity.z -= 400.0 * delta;
        if ( moveBackward ) velocity.z += 400.0 * delta;
        if ( moveLeft ) velocity.x -= 400.0 * delta;
        if ( moveRight ) velocity.x += 400.0 * delta;
        if ( isOnObject === true ) {
            velocity.y = Math.max( 0, velocity.y );
            canJump = true;
        }
        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );
        if ( controls.getObject().position.y < 10 ) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
        }
        prevTime = time;
    }
    /**Controls setings**/
	renderer.render(scene, camera);
}

function configControls(havePointerLock) {
    havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if ( havePointerLock ) {
        var element = document.body;
        var pointerlockchange = function ( event ) {
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
                controlsEnabled = true;
                controls.enabled = true;
                blocker.style.display = 'none';
            } else {
                controls.enabled = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
            }
        };
        var pointerlockerror = function ( event ) {
            instructions.style.display = '';
        };
        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
        instructions.addEventListener( 'click', function ( event ) {
            instructions.style.display = 'none';
            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            if ( /Firefox/i.test( navigator.userAgent ) ) {
                var fullscreenchange = function ( event ) {
                    if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                        document.removeEventListener( 'fullscreenchange', fullscreenchange );
                        document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                        element.requestPointerLock();
                    }
                };
                document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();
            } else {
                element.requestPointerLock();
            }
        }, false );
    } else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }

    /************************/
    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true; break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;
        }
    };
    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    function setSkyBox() {
        var cube = new THREE.CubeGeometry(1000, 1000, 1000);
        var cubeMaterials = [
            // back side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('textures/skybox/back.png'),
                side: THREE.DoubleSide
            }),
            // front side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('textures/skybox/front.png'),
                side: THREE.DoubleSide
            }),
            // Top side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('textures/skybox/header.png'),
                side: THREE.DoubleSide
            }),
            // Bottom side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('textures/skybox/footer.png'),
                side: THREE.DoubleSide
            }),
            // right side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('textures/skybox/right.png'),
                side: THREE.DoubleSide
            }),
            // left side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('textures/skybox/left.png'),
                side: THREE.DoubleSide
            })
        ];
        //add cube & materials
        var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
        var sky = new THREE.Mesh(cube, cubeMaterial);
        scene.add(sky);

    }

}

window.onload = init;
