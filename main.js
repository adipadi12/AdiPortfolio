import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );

const loader = new GLTFLoader();
loader.load( './portfolio.glb', function ( glb ) {
    scene.add( glb.scene );
}, undefined, function ( error ) {
    console.error( error );
} );

const light = new THREE.DirectionalLight( 0xffffff, 3 );
light.position.set( 5, 5, 5 );
scene.add( light );

const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( 
    aspect * 100 / - 2,
    aspect * 100 / 2,
    100 / 2,
    100 / - 2,
    1,
    1000 );

scene.add( camera );

camera.position.x = 66;
camera.position.y = 79;
camera.position.z = 105;

const controls = new OrbitControls( camera, canvas );
controls.update();

function onWindowResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
}
window.addEventListener('resize', onWindowResize);

camera.position.z = 5;

function animate() {    
    //console.log(camera.position);
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );