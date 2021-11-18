const spaceShipUrl = "assets/models/spaceship2.gltf";

const rocks = {
  rock2: "assets/models/rock2.gltf",
  rockBlue: "assets/models/rockBlue.gltf",
  rockRed: "assets/models/rockRed.gltf",
  rockPurple: "assets/models/rockPurple.gltf"
}

const hdriUrl = "assets/HDR/kloppenheim.hdr";
const src = {
  sound: 'assets/sound',
  texture: 'assets/images/texture',
  cubeMap: 'assets/images/texture/cubeMap/'
}

const sound = {
  bgm: src.sound + '/bgm.mp3',
  passby: src.sound + '/passby.mp3',
  shoot: src.sound + '/shoot-laser.wav',
  blast: src.sound + '/blast.wav'
}

const textures = {
  mars: {
    color: src.texture + '/mars/blueMap.png',
    aomap: src.texture + '/mars/AmbientOcclusionMap.png',
    normalmap: src.texture + '/mars/NormalMap.png',
    bumpmap: src.texture + '/mars/DisplacementMap.png',
    light: "#E57A50",
    background: "#0a0501"
  },

  neptune: {
    color: src.texture + '/neptune/colorMap.jpg',
    light: "#3B6CC9",
    background: "#0a0501"
  },

  mercury: {
    color: src.texture + '/mercury/colorMap.jpg',
    light: "#afafaf",
    background: "#111111"
  }
}

let models = {
    spaceShip: {
        url: spaceShipUrl,
        model:undefined,
        scale: 2
    },
    rock: {
        url: rocks.rock2,
        model: undefined,
        scale: 0.7
    }
}

const Models = {
  spaceship:undefined,
  rocks:{}
};

const scene = new THREE.Scene();
scene.background = new THREE.Color("#0a0501")

let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
// const camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
camera.position.set(0,75,125);
camera.lookAt(new THREE.Vector3(0,0,-50))

const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.querySelector("body").append(renderer.domElement);

window.addEventListener('resize', ()=> {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.render( scene, camera );
})

// const controls = new THREE.OrbitControls(camera, renderer.domElement);

const light = new THREE.PointLight( "#0f0f0f", 5, 1000 );
light.position.set(camera.position.x,camera.position.y,camera.position.z);
light.castShadow = true;
scene.add(light)

const directionalLight = new THREE.PointLight( "#E57A50", 2, 2000 );
directionalLight.position.set(200,50,-750);
scene.add( directionalLight );

const directionalLight2 = new THREE.PointLight( "#E57A50", 0.5, 1000 );
directionalLight2.position.set(-200,-50,-500);
scene.add( directionalLight2 );

const planetGeo = new THREE.SphereGeometry(1750,32,32);
const planetMat = new THREE.MeshPhysicalMaterial({
  map: new THREE.TextureLoader().load(textures.mars.color),
  color: "#666666"
});

const planetMesh = new THREE.Mesh(planetGeo,planetMat);
planetMesh.position.set(-2200, -800,-1750);

scene.add(planetMesh);

function loadMap(map) {
  planetMat.map = new THREE.TextureLoader().load(map.color);
  scene.background = new THREE.Color(map.background);
  directionalLight.color.set(map.light);
}



//------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------


var env_maps = {};

const inputElement = document.getElementById("btnEnvMap");
inputElement.addEventListener("change", handleFiles, false);

function handleFiles() {
  const file = this.files[0]; /* now you can work with the file list */
  var ext = file.name.split(".");
  ext = ext.splice(-1);
  var url = URL.createObjectURL(file);

  if (ext == "hdr" || ext == "exr") {
    env_maps[file.name] = url;
    addEnvMap(url, file.name);
  } else if (ext == "glb" || ext == "gltf") {
    load3d(url);
  } else alert("Usupported File Format");
}

function addEnvMap(path, mapName) {
    new THREE.RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .load(path, (hdrEquiRect, textureData) => {
        var pmrem = new THREE.PMREMGenerator(renderer);
        hdrCubeRenderTarget = pmrem.fromEquirectangular(hdrEquiRect);
        pmrem.compileCubemapShader();

        scene.environment = hdrCubeRenderTarget.texture;
        scene.background = hdrCubeRenderTarget.texture;
      });
}

load3d(models.spaceShip.url, (el)=> {
    models.spaceShip.model = el;
    playerObj.add(el);
    el.rotation.y = Math.PI;
    el.scale.set(30,30,30);
});

load3d(models.rock.url, (el)=> {
    models.rock.model = el;
    el.scale.set(15,15,15);
  });
  
for (const k in rocks) {
  load3d(rocks[k], (model)=> {
    model.scale.set(15,15,15);
    Models.rocks[k] = model;
  })
}

// addEnvMap(hdriUrl);

function load3d(path, saveModel) {
    const loader = new THREE.GLTFLoader();
    loader.load(path, function (gltf) {
        saveModel(gltf.scene)
    });
}


// const format = '.png';
// const urls = [
//   src.cubeMap + 'px' + format, src.cubeMap + 'nx' + format,
//   src.cubeMap + 'py' + format, src.cubeMap + 'ny' + format,
//   src.cubeMap + 'pz' + format, src.cubeMap + 'nz' + format
// ];

// const reflectionCube = new THREE.CubeTextureLoader().load( urls );
// const refractionCube = new THREE.CubeTextureLoader().load( urls );
// refractionCube.mapping = THREE.CubeRefractionMapping;
// const texture = new THREE.TextureLoader().load( "assets/images/bg.png" );
// scene.background = texture;

//---------------------------------------------------------------------------------------------------------------------------------------------------------
//---- LOADING SOUNDS --------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------

const bgmAudio = new Howl({
  src: [sound.bgm],
  loop: true,
  volume: 0.3
})

const passbyAudio = new Howl({
  src: [sound.passby],
  volume: 0.3
})

const shootAudio = new Howl({
  src: [sound.shoot],
  volume: 0.3
})

const blastAudio = new Howl({
  src: [sound.blast],
  volume: 0.1
})


//---------------------------------------------------------------------------------------------------------------------------------------------------------
//---- UTIL FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------

     
let vectorDistance = (point1,point2) => {
  var disX = point1[0] - point2[0];
  var disY = point1[1] - point2[1];

  return Math.hypot(disX,disY);
}

let getDisplacement = (length, angle) => {          //! NEED TO RECHECK THIS FUNCTION, CURRENTLY USED IN TRAVEL FUNCTION @PUPPET
  var dx = Math.cos(angle)*length;
  var dy = Math.sin(angle)*length;

  return [dx,dy];
}

let radOf = (angle)=> {
return angle*(Math.PI/180);
}

let angleOf = (rad) => {
return rad*(180/Math.PI);
}

let vectorDirection = (center,point) => {
  var x = point[0] - center[0];
  var y = point[1] - center[1];

  var ang = angleOf(Math.atan2(x,y));

 if(ang<0) { ang = Math.abs(ang) + 90; }
  else {
      ang = 90-ang;
      ang = ang < 0 ? 360+ang: ang;
  } return ang;
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

var randomProperty = function (obj) {
  var keys = Object.keys(obj);
  return obj[keys[ keys.length * Math.random() << 0]];
};