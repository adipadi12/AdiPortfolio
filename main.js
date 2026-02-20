import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {Octree} from "three/addons/math/Octree.js";
import {Capsule} from "three/addons/math/Capsule.js";

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Physics stuff
const GRAVITY = 30;
const CAPSULE_RADIUS = 0.5;
const CAPSULE_HEIGHT = 8;
const JUMP_HEIGHT = 25;
const MOVE_SPEED = 25;

let character = {
    instance: null,
    isMoving: false,
    spawnPosition: new THREE.Vector3()
};

const colliderOctree = new Octree();
const playerCollider = new Capsule(new THREE.Vector3(0, CAPSULE_RADIUS, 0),
                                     new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
                                     CAPSULE_RADIUS
);

let playerVelocity = new THREE.Vector3();
let playerOnFloor = false;

let targetRotationY = Math.PI / 2; // Default rotation (facing left)a

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

const modalContent = {
    "Proj1": {
title: "Project 1",
content: "UnityRender",
link: "https://github.com/adipadi12/Prototyping",
},
"Proj2": {
    title: "Project 2",
    content: "TerminalGame",
    link: "https://github.com/adipadi12/Cpp-AppDev",
},
"Proj3": {
    title: "Project 3",
    content: "CustomRenderer",
    link: "https://github.com/adipadi12/OpenGL-Project",
},
}

const modal = document.querySelector(".modal");
const modalTitle = document.querySelector(".modal-title");
const modalDescription = document.querySelector(".modal-project-description");
const modalExitButton = document.querySelector(".modal-exit-button");
const modalVisitButton = document.querySelector(".modal-project-visit-button");

function showModal(id) {
    const content = modalContent[id];
    if(content) {
        modalTitle.textContent = content.title;
        modalDescription.textContent = content.content;
        document.querySelector(".modal").style.display = "block";
        modal.classList.toggle("hidden");
    } 
    if(content.link) {
        modalVisitButton.href = content.link;
        modalVisitButton.classList.remove("hidden");
    } else {
        modalVisitButton.classList.add("hidden");
    }
}

function hideModal() {
    modal.classList.toggle("hidden");
}

modalExitButton.addEventListener("click", () => {
    document.querySelector(".modal").style.display = "none";
});

let intersectObject = "";
const intersectObjects = [];
const intersectObjectsNames = [
    "Proj1",
    "Proj2",
    "Proj3"
];


const loader = new GLTFLoader();
loader.load( './portfolio_collider1.glb', 
    function ( glb ) {
        glb.scene.traverse(child => {
            if (intersectObjectsNames.includes(child.name)) {
                intersectObjects.push(child.parent);
            }
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.metalness = 0.5;
            }
            console.log(child);

            if(child.name === "Character") {
                character.spawnPosition.copy(child.position)
                character.instance = child;
                playerCollider.start
                .copy(child.position)
                .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));

                playerCollider.end
                .copy(child.position)
                .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));
            }

            if(child.name === "Ground_Collider"){
                colliderOctree.fromGraphNode(child);
                child.visible = false;
            }
        });
        scene.add( glb.scene );
}, 
undefined, 
function ( error ) {
console.error( error );
} );

const sun = new THREE.DirectionalLight( 0xffffff, 4 );
sun.position.set( 100,100,200 );
sun.target.position.set( 5, 0, 0 );
sun.castShadow = true;
sun.shadow.camera.left = -200;
sun.shadow.camera.right = 200;
sun.shadow.camera.top = 200;
sun.shadow.camera.bottom = -200;
sun.shadow.normalBias = 1.8;
scene.add( sun );

// const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
// scene.add( shadowHelper );
// const helper = new THREE.DirectionalLightHelper( sun, 5 );
// scene.add( helper );

const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
scene.add( ambientLight );

const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( 
    aspect * 100 / - 2,
    aspect * 100 / 2,
    100 / 2,
    100 / - 2,
    0.1, //change to 0.1 to avoid z-fighting
    1000 );

scene.add( camera );

camera.position.x = 146;
camera.position.y = 139;
camera.position.z = 135;

const cameraOffset = new THREE.Vector3(146, 139, 135);

const controls = new OrbitControls( camera, canvas );
controls.update();

function onWindowResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;

    camera.left = -aspect * 100 / 2;
    camera.right = -aspect * 100 / 2;
    camera.top =  100 / 2;
    camera.bottom = -100 / 2;

    camera.updateProjectionMatrix();

    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
}

function onPointerMove( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onClick() {
    console.log(intersectObject);
    if(intersectObject !== "") {
        showModal(intersectObject);
    }  
}

function respawnCharacter(){
    character.instance.position.copy(character.spawnPosition)

    playerCollider.start
                .copy(character.spawnPosition)
                .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));

    playerCollider.end
                .copy(character.spawnPosition)
                .add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0));

    playerVelocity.set(0,0,0);
    targetRotationY = Math / PI;
    character.isMoving = false;
}

function playerCollisions(){
    const result = colliderOctree.capsuleIntersect(playerCollider);
    playerOnFloor = false;

    if(result){
        playerOnFloor = result.normal.y > 0;
        playerCollider.translate(result.normal.multiplyScalar(result.depth));

        if(playerOnFloor){
            character.isMoving = false;
            playerVelocity.x = 0;
            playerVelocity.z = 0;
        }

    }
}

function updatePlayer(){
    if (!character.instance) {
        return;
    }
    if(character.instance.position.y < -10){
        respawnCharacter();
        return;
    }
    if(!playerOnFloor){
        playerVelocity.y -= GRAVITY * 0.05;
    }

    playerCollider.translate(playerVelocity.clone().multiplyScalar(0.01));

    playerCollisions();

    character.instance.position.y -= CAPSULE_RADIUS;
    character.instance.position.copy(playerCollider.start);

    let rotationDiff = (((targetRotationY - character.instance.rotation.y) % (2 * Math.PI) +
        3 * Math.PI) %
        (2 * Math.PI)) - Math.PI;
    let finalRotation = character.instance.rotation.y + rotationDiff;

    character.instance.rotation.y = THREE.MathUtils.lerp(
        character.instance.rotation.y,
        finalRotation,
        0.1
    )

}

function onKeyDown(event) {
    if(event.key.toLowerCase() === "r"){
        respawnCharacter();
        return;
    }
    if(character.isMoving) return; // Prevent new movement if already moving

    console.log(event.key);
    switch(event.key.toLowerCase()) {
        case "d":
        case "arrowright":
            playerVelocity.z -= MOVE_SPEED;
            targetRotationY = Math.PI; // Face right
            break;
        case "a":
        case "arrowleft":
            playerVelocity.z += MOVE_SPEED;
            targetRotationY = 0; // Face left
            break;
        case "w":
        case "arrowup":
            playerVelocity.x -= MOVE_SPEED;
            targetRotationY = -Math.PI / 2; // Face forward
            break;
        case "s":
        case "arrowdown":
            playerVelocity.x += MOVE_SPEED;
            targetRotationY = Math.PI / 2; // Face backward
            break;
        default:
            return; // Exit if it's not a movement key
    }
    playerVelocity.y = JUMP_HEIGHT;
    character.isMoving = true;
}
window.addEventListener('resize', onWindowResize);
window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener('click', onClick);
window.addEventListener('keydown', onKeyDown);


function onAnimate() {    
    updatePlayer();
    //console.log(camera.position);
    if(character.instance){
        camera.position.copy(character.instance.position).add(cameraOffset);
        camera.lookAt(character.instance.position);
    }

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( intersectObjects ,true);

    if(intersects.length > 0){
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
        intersectObject = "";
    }

    for ( let i = 0; i < intersects.length; i++ ) {
        intersectObject = intersects[0].object.parent.name;
    }
   
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( onAnimate );