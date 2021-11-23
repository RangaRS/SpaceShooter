import * as THREE from 'three';
import { Game } from './main.js';
import rock from '../assets/models/rock2.gltf'
import rockBlue from '../assets/models/rockBlue2.gltf'
import rockRed from '../assets/models/rockRed2.gltf'
import rockPurple from '../assets/models/rockPurple2.gltf'
import spaceship from '../assets/models/spaceship2.gltf'
import shootAudio from '../assets/sound/shoot-laser.wav';
import blastAudio from '../assets/sound/blast.wav';
import bgmAudio from '../assets/sound/bgm.mp3';
import * as Utils from './utils.js';
import '../styles/style.css';
import Stats from 'three/examples/jsm/libs/stats.module'

const startBtn = document.getElementById('start');
const startBtn2 = document.getElementById('start2');
const scoreCard = document.getElementById('score'); 
const bulletsCard = document.getElementById('bullets'); 
const sHealthCard = document.getElementById('ShipHealth'); 


let elUpdateAnimation = (el)=> {

    el.style.transform = "scale(1.3)";

    setTimeout(()=> {

        el.style.transform = "scale(1.0)";

    }, 50);
}


let g = new Game();

let scene = g.scene,
camera    = g.camera,
renderer  = g.renderer,
canvas    = g.canvas,
mouse     = g.mouse;

camera.position.set(0,50,-150);


let astroids = new THREE.Group();
let stars = new THREE.Group();
let bullets = new THREE.Group();

scene.add(astroids, stars, bullets);

let gameState = {
    ready: false,
    isRunning: false
}

let updateScore = (val=0)=> {

    g.options.data.score+=val;
    scoreCard.innerText = g.options.data.score;
    elUpdateAnimation(scoreCard);

}


let updateLife = (val=0)=> {
    
    g.options.data.health+=val;
    
    if(g.options.data.health <=0) {

        g.options.data.health=0;
        clearActions();
    }

    document.getElementById('shipHealthText').innerText = "PLANET HEALTH: " + g.options.data.health;
    sHealthCard.style.width = `${g.options.data.health/200 * 100}%`;
}



let updateBullets = (val=0)=> {

    g.options['data'].bullets+=val;
    if(g.options.data.bullets >50) { g.options.data.bullets = 50};
    if(g.options.data.bullets <0) { g.options.data.bullets = 0};
    
    document.getElementById('bulletsText').innerText = 'BULLETS AVAILABLE: ' + g.options.data.bullets;
    bulletsCard.style.width = `${g.options.data.bullets/50 * 100}%`;

}


Promise.all([
    
    g.loadModel(spaceship, 'spaceship'),
    g.loadModel(rock, 'rock'),
    g.loadModel(rockBlue, 'rockBlue'),
    g.loadModel(rockRed, 'rockRed'),
    g.loadModel(rockPurple, 'rockPurple'),

    g.loadSound(shootAudio, 'shootAudio'),
    g.loadSound(blastAudio, 'blastAudio'),
    g.loadSound(bgmAudio, 'bgmAudio', true, 0.4)

]).then(()=>{

    let starGeo = new THREE.BoxGeometry(.5,.5,.5);
    let starMat = new THREE.MeshBasicMaterial({color: '#ffffff'});    
    g.saveModel(new THREE.Mesh(starGeo, starMat), 'star');


    let bulletGeo = new THREE.BoxGeometry(1.5,1.5,30);
    let bulletMat = new THREE.MeshPhysicalMaterial({ color: "#5169dc", emissive: 0x5169dc });
    g.saveModel(new THREE.Mesh(bulletGeo, bulletMat),'bullet');


    g.Models.spaceship.scale.set(30,30,30);
    g.Models.spaceship.position.set(0,0,30);
    g.Models.spaceship.rotation.y = Math.PI;


    const rayGeo = new THREE.BoxGeometry( 0.25, 0.25, 600 );
    const rayMat = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
    const ray = new THREE.Mesh( rayGeo, rayMat );
    rayGeo.translate(0,0,-300)
    

    const playerObj = new THREE.Group();
    playerObj.add( g.Models.spaceship, ray );
    g.saveModel(playerObj, 'player');    


    scene.add( g.Models.player );    


    g.init();
    gameState.ready = true;
    completeSetup();

    renderer.domElement.addEventListener('click', event=> {
        shootBullet();
    })

})


let completeSetup = ()=> {

    startBtn.addEventListener('click', ()=> gameActions() )
    startBtn2.addEventListener('click', ()=> gameActions() )

    g.options['generateStarsLoop'] = setInterval(()=> {

        let starMesh = g.Models.star.clone();

        let x = (Math.random()*2 - 1) * 400;
        let y = (Math.random()*2 - 1) * 400;
        let z = -1500;
        
        starMesh.position.set(x*2,y*2,z);
        stars.add(starMesh);

    }, 15);

    gameState.isRunning = true;

}


let clearActions = ()=> {

    g.sound.bgmAudio.stop();
    gameState.isRunning = false;
    clearInterval(g.options.generateAstroidLoop);

    let endTime = Math.round(Date.now() / 1000);
    let surScr = (endTime - g.options.data.startTime)*50;
    let astDst = g.options.data.score * 20;
    let total = astDst + surScr;

    document.getElementById('endScore').innerText = `SURVIVAL DURATION : ${surScr/50} x 50 = ${surScr} \n
                                                     ASTROIDS DESTROID : ${g.options.data.score} x 20 = ${astDst} \n
                                                     TOTAL SCORE : ${total}`;
    document.getElementById('endCard').style.display = 'block';

}


let gameActions = ()=> {

    g.options['data'] = {
        score: 0,
        health: 200,
        distance: 0,
        bullets: 50,
        startTime: Math.round(Date.now() / 1000)
    }

    document.getElementById('mainmenu').style.display = 'none';
    document.getElementById('endCard').style.display = 'none';

    g.sound.bgmAudio.play();

    g.options['generateAstroidLoop'] = setInterval(()=> {

        let d = Math.round(Math.random()*10);
            let astroid = undefined;
            
            if(d < 7) {

                astroid = g.Models.rock.clone();
                astroid.userData.type = 'regular'

            } else if(d == 7) {

                astroid = g.Models.rockBlue.clone();
                astroid.userData.type = 'bullets';

            } else if(d == 8) {

                astroid = g.Models.rockRed.clone();
                astroid.userData.type = 'health';

            } else if(d >= 9) {

                astroid = g.Models.rockPurple.clone();
                astroid.userData.type = 'both';

            }
            
            astroid.userData.spin = new THREE.Vector3(Math.random()/100, Math.random()/100, Math.random()/100);
            astroid.userData.health = 20;
            
            let x = (Math.random()*2 - 1) * 100;
            let y = (Math.random()*2 - 1) * 100;
            
            astroid.scale.set(10,10,10)
            astroid.position.set(x, 0, -1200);
            astroids.add(astroid)

    }, 750)

}


const light = new THREE.PointLight( "#0f0f0f", 5, 1000 );
light.castShadow = true;
scene.add(light)


let animateAstroids = ()=> {

    astroids.children.forEach(astroid => {

        astroid.rotation.x+=astroid.userData.spin.x;
        astroid.rotation.y+=astroid.userData.spin.y;
        astroid.rotation.z+=astroid.userData.spin.z;

        astroid.position.z+=3;

        if(astroid.position.z > 100) {

            astroids.remove(astroid);
            updateLife(-20);

        }
    })
}

    
let animateStars = ()=> {

    stars.children.forEach((star,i) => {

        star.position.z+=3;
        if(star.position.z > 100) {

            stars.remove(star);

        }
    })
}


let updatePlayer = ()=> {

    let playerObj = g.Models.player;
    let playerPos = {};
    Object.assign(playerPos, playerObj.position);

    let x = mouse.x*200/1;
    let y = mouse.y*200/1.5;

    var ang = Utils.vectorDirection( [ playerObj.position.x, playerObj.position.y ], [x,y]);
    var dist = Utils.vectorDistance( [ playerObj.position.x, playerObj.position.y ], [x,y]);
    
    var displ = Utils.getDisplacement( 0.008 * dist, Utils.radOf(ang) );
    var nx = playerPos.x + displ[0];

    playerObj.position.x = Utils.clamp( nx, -200/2, 200/2 );

    if( displ[0] > 0.5 || displ[0] < -0.5 ) {

            let ds = displ[0] > 0 ? -0.008: 0.008;
            let r  = playerObj.rotation.z + ds;
            playerObj.rotation.z = Utils.clamp( r, -Math.PI/7, Math.PI/7 );

    } else { playerObj.rotation.z*=0.985 }

}


let shootBullet = ()=> {

    if(g.options.data.bullets > 0) {

        let bullet = g.Models.bullet.clone();

        bullet.position.set(
            g.Models.player.position.x,
            g.Models.player.position.y,
            -10);
            
            bullets.add(bullet);
            g.sound.shootAudio.play();
            updateBullets(-1);
    }

}


let animateBullets = ()=> {

    bullets.children.forEach( bullet => {

        bullet.position.z-=5;

        astroids.children.forEach(astroid=> {

            if( bullet.position.distanceTo(astroid.position) < 50 ) {
                
                let isColloide = g.checkBoundingBoxCollusion(bullet, astroid);
                
                if(isColloide) {
                    
                    g.sound.blastAudio.play();
                    bullets.remove(bullet);

                    astroid.userData.health-=10;
                    
                    if(astroid.userData.health <= 0) {

                        validateAstroid(astroid.userData.type);
                        astroids.remove(astroid);
                        updateScore(1);
                    }
                    
                } else if(bullet.position.z < -2000) {
                    
                    bullets.remove(bullet);
                    
                }
            }
        })

    })
}


let validateAstroid = (type)=> {

    if(type == 'bullets') {

        updateBullets(10);

    } else if(type == 'health' && g.options.data.health.life < 200) {

        updateLife(10);

    } else if(type == 'both') {

        updateBullets(5);
        if(g.options.data.health < 200) { updateLife(5) };

    }
}

let stats = Stats();
document.querySelector('body').appendChild( stats.dom );



const animate = function () {

    if(gameState.ready) {
        animateStars();
        animateAstroids();
        updatePlayer();
        animateBullets();

        g.Models.planet.rotation.x+=  0.0001;
    }

    camera.lookAt(new THREE.Vector3(0,0,0));
    light.position.set(camera.position.x,camera.position.y,camera.position.z);
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
    stats.update();
};

animate();