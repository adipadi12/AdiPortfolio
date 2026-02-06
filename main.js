import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

let character = {
    instance: null,
    moveDistane: 5,
    jumpHeight: 2,
    isMoving: false,
    moveDuration: 0.05,
};

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
loader.load( './portfolio.glb', 
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
                character.instance = child;
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

const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
scene.add( shadowHelper );
const helper = new THREE.DirectionalLightHelper( sun, 5 );
scene.add( helper );

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

function moveCharacter(targetPosition, targetRotationY) {
    character.isMoving = true;

    const t1 = gsap.timeline({
        onComplete: () => {
            character.isMoving = false;
        }
    });
    t1.to(character.instance.position, {
        x: targetPosition.x,
        z: targetPosition.z,
        duration: character.moveDuration,
    });
    t1.to(character.instance.position, {
        x: targetPosition.x,
        y: character.instance.position.y + character.jumpHeight,
        yoyo: true,
        repeat: 1,
        z: targetPosition.z,
        duration: character.moveDuration,
    });
    t1.to(character.instance.rotation, {
        y: targetRotationY,
        duration: character.moveDuration,
    }, 0);
}

function onKeyDown(event) {
    if(character.isMoving) return; // Prevent new movement if already moving

    const targetPosition = new THREE.Vector3().copy(character.instance.position);
    console.log(event.key);
    switch(event.key.toLowerCase()) {
        case "d":
        case "arrowright":
            targetPosition.z -= character.moveDistane;
            targetRotationY = Math.PI; // Face right
            break;
        case "a":
        case "arrowleft":
            targetPosition.z += character.moveDistane;
            targetRotationY = 0; // Face left
            break;
        case "w":
        case "arrowup":
            targetPosition.x -= character.moveDistane;
            targetRotationY = -Math.PI / 2; // Face forward
            break;
        case "s":
        case "arrowdown":
            targetPosition.x += character.moveDistane;
            targetRotationY = Math.PI / 2; // Face backward
            break;
        default:
            return; // Exit if it's not a movement key
    }
    moveCharacter(targetPosition, targetRotationY);
}
window.addEventListener('resize', onWindowResize);
window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener('click', onClick);
window.addEventListener('keydown', onKeyDown);


function onAnimate() {    
    //console.log(camera.position);
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