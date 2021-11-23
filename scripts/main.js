import * as THREE from 'three';
import {PMREMGenerator} from 'three/src/extras/PMREMGenerator.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Howl, Howler} from 'howler';
import marsTexture from '../assets/images/texture/mars/blueMap.png'



export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({antialias: true,});
        this.listener = new THREE.AudioListener();
        this.raycaster = new THREE.Raycaster();
        this.canvas = this.renderer.domElement;
        this.Models = {};
        this.options = {};
        this.mouse = new THREE.Vector2();
        this.sound = {};

        this.scene.fog = new THREE.Fog(0x000000, 500, 1500);


        this.renderer.domElement.addEventListener('mousemove', event=> {

            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        });
    }

    init() {
        this.scene.background = new THREE.Color('#000000')                
        this.camera.position.set(0, 50, 150);        
        this.camera.add( this.listener );
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.querySelector('body').append(this.canvas);

        window.addEventListener('resize', ()=> {
            this.camera.aspect = window.innerWidth/window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.renderer.render( this.scene, this.camera );
        })

        
        const directionalLight = new THREE.PointLight( "#E57A50", 2, 2000 );
        directionalLight.position.set(200,50,-750);
        this.scene.add( directionalLight );
        
        const directionalLight2 = new THREE.PointLight( "#E57A50", 0.5, 1000 );
        directionalLight2.position.set(-200,-50,-500);
        this.scene.add( directionalLight2 );

        const planetGeo = new THREE.SphereGeometry(1750,32,32);
        const planetMat = new THREE.MeshPhysicalMaterial({
            map: new THREE.TextureLoader().load(marsTexture),
            color: "#666666"
        });

        const planet = new THREE.Mesh(planetGeo,planetMat);
        planet.position.set(0, -2000,-100);
        this.saveModel(planet, 'planet');

        this.scene.add(this.Models.planet);

        // const controls = new OrbitControls(this.camera, this.renderer.domElement);

    }


    loadModel(path, name) {

        return new Promise((resolve, reject)=>{

            const loader = new GLTFLoader();
            loader.load(path, (model)=> {

                this.saveModel(model.scene, name);
                resolve();
            });
        }) 
    }


    saveModel(model, name) {

        this.Models[name] = model;
    }


    loadSound(path, name, loop=false, vol=0.5) {

        return new Promise((resolve, reject)=>{

            const sound = new Howl({
                src: [path],
                loop: loop,
                volume: vol
              })

              this.saveSound(sound, name);
              resolve();

            // const s = new Audio( this.listener );
            // const audioLoader = new THREE.AudioLoader();

            // audioLoader.load( path, ( buffer )=> {

            //     s.setBuffer( buffer );
            //     s.setVolume( 0.5 );
            //     s.play();
            //     this.saveSound(s, name);
            //     resolve();

            // });
        });
    }
    
    
    saveSound(sound, name) {

        this.sound[name] = sound;

    }


    loadEnvMap(path, mapName) {

        new RGBELoader()
          .setDataType(THREE.UnsignedByteType)
          .load(path, (hdrEquiRect, textureData) => {

            var pmrem = new PMREMGenerator(renderer);
            hdrCubeRenderTarget = pmrem.fromEquirectangular(hdrEquiRect);
            pmrem.compileCubemapShader();
    
            scene.environment = hdrCubeRenderTarget.texture;
            scene.background = hdrCubeRenderTarget.texture;

          });
    }


    rayTesting(obj, testGroup, direction, dist) {

        return new Promise((resolve, reject)=> {
  
            let origin = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
            
            this.raycaster.set(origin,direction);
            this.raycaster.far = dist;
            
            testGroup.children.forEach(child=> {
                
                const intersects = this.raycaster.intersectObjects( child.children );
                resolve(intersects);
                
            })
        })
    }

    checkBoundingBoxCollusion(obj1, obj2) {

            const box1 = new THREE.Box3().setFromObject(obj1);
            const box2 = new THREE.Box3().setFromObject(obj2);

            return box1.intersectsBox(box2);
    }

}