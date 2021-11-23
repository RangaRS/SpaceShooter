import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import * as main from './threeMain.js';
import spaceShipModel from '../assets/models/spaceship.gltf';


let Models = {}; 

const scene = new THREE.Scene();
scene.background = new THREE.Color("#111111")

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.querySelector("body").append(renderer.domElement);

let adjustWindow = ()=> {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.render( scene, camera );
}

window.addEventListener('resize', ()=> {
    adjustWindow();
})

const clock = new THREE.Clock();
const controls = new OrbitControls(camera, renderer.domElement);

const lamp = new THREE.PointLight( "#ffffff", 2, 500 );
lamp.position.set(0,100,0);
lamp.castShadow = true;
scene.add(lamp);

const planeGeo = new THREE.PlaneGeometry(10,10);
const planeMat = new THREE.MeshBasicMaterial({
    color: "#ff00f0"
})

const planeSurface = new THREE.Mesh(planeGeo, planeMat);
scene.add(planeSurface);

main.load3d(spaceShipModel,'spaceship', (model)=>{
    Models['spaceship'] = model;
    scene.add(Models.spaceship);
})

const animate = function () {
    lamp.position.set(camera.position.x, camera.position.y, camera.position.z)
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();