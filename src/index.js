import * as THREE from 'three/build/three.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { TweenMax } from 'gsap/gsap-core';
import throttle from 'lodash/throttle';

let scene, camera, renderer, hlight, directionalLight, light, light2, controls, circle1, circle2, circle3, house, labelRenderer;

function init() {
  scene = new THREE.Scene();
  //  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 5000);
  camera.rotation.y = 45/180*Math.PI;
  camera.position.x = 320;
  camera.position.y = 200;
  camera.position.z = 360;

  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
  renderer.setClearColor( 0xffffff, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement)

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.autoRotate = true;
  // ---------- limit rotation vertical
  // controls.minPolarAngle = 45/180*Math.PI;
  // controls.maxPolarAngle = Math.PI/2; // don't let to go below the ground
  // controls.minDistance = 300; // max zoom in
  // controls.maxDistance = 700; // max zoom out
  // ---------- limit rotation horizontal
  // controls.minAzimuthAngle = 0;
  // controls.maxAzimuthAngle = Math.PI/2;

  hlight = new THREE.AmbientLight(0x404040, 5);
  scene.add(hlight);

  directionalLight = new THREE.DirectionalLight(0x404040, 5);
  directionalLight.position.set(0,1,0);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  light = new THREE.PointLight(0x404040, 4);
  light.position.set(0, -800, 0);
  light.castShadow = true;
  scene.add(light);

  light2 = new THREE.PointLight(0x404040, 5);
  light2.position.set(550, 1000, 550);
  light2.castShadow = true;
  scene.add(light2);

  // add circle dot
  let geometry = new THREE.CircleGeometry( 8, 32 );
  let material1 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  let material2 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  let material3 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  circle1 = new THREE.Mesh( geometry, material1 );
  circle2 = new THREE.Mesh( geometry, material2 );
  circle3 = new THREE.Mesh( geometry, material3 );
  scene.add( circle1 );
  scene.add( circle2 );
  scene.add( circle3 );
  circle1.position.set(32, 55, 7);
  circle2.position.set(75, 25, 105);
  circle3.position.set(0, 100, 150);

  let loader = new GLTFLoader();
  loader.load('object/scene.gltf', (gltf) => {
      house = gltf.scene;
      house.children[0].scale.set(1, 1, 1);
      scene.add(house);
      animate();
  });

  // DOM Labels

  var doorDiv = document.createElement( 'div' );
  doorDiv.className = 'label';
  doorDiv.textContent = 'Door';
  doorDiv.style.marginTop = '-1em';
  doorDiv.style.fontSize = '2em';
  doorDiv.style.color = '#fff';
  var doorLabel = new CSS2DObject( doorDiv );
  doorLabel.position.set( 0, 8, 0 );
  circle1.add( doorLabel );

  var fireDiv = document.createElement( 'div' );
  fireDiv.className = 'label';
  fireDiv.textContent = 'Fire';
  fireDiv.style.marginTop = '-1em';
  fireDiv.style.fontSize = '2em';
  fireDiv.style.color = '#fff';
  var fireLabel = new CSS2DObject( fireDiv );
  fireLabel.position.set( 0, 8, 0 );
  circle2.add( fireLabel );

  var treeDiv = document.createElement( 'div' );
  treeDiv.className = 'label';
  treeDiv.textContent = 'Tree';
  treeDiv.style.marginTop = '-1em';
  treeDiv.style.fontSize = '2em';
  treeDiv.style.color = '#fff';
  var treeLabel = new CSS2DObject( treeDiv );
  treeLabel.position.set( 0, 8, 0 );
  circle3.add( treeLabel );

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize( window.innerWidth, window.innerHeight );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild( labelRenderer.domElement );

  controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.minPolarAngle = 45/180*Math.PI;
  controls.maxPolarAngle = Math.PI/2; // don't let to go below the ground
  controls.minDistance = 300; // max zoom in
  controls.maxDistance = 700; // max zoom out

  // Helpers
  // var axesHelper = new THREE.AxesHelper( 200 );
  // scene.add( axesHelper );
}

function animate() {
    requestAnimationFrame(animate);
    circle1.rotation.y = Math.atan2( ( camera.position.x - circle1.position.x ), ( camera.position.z - circle1.position.z ) );
    circle2.rotation.y = Math.atan2( ( camera.position.x - circle2.position.x ), ( camera.position.z - circle2.position.z ) );
    circle3.rotation.y = Math.atan2( ( camera.position.x - circle3.position.x ), ( camera.position.z - circle3.position.z ) );

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render( scene, camera );
}

function updateCanvasSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

init();
window.addEventListener('resize', updateCanvasSize);

let mouse = new THREE.Vector2(0,0);
let raygun = new THREE.Raycaster();
let useRaycast = true;
let hits;

// Raycast when mouse over
function onMouseMove (event) {
  watchMouse(event)
  if (hits.length > 0) {
      for (var i = 0; i < hits.length; i++ ) {
        document.body.style.cursor = 'pointer';
        console.log(hits[i]);
        // Change material color of item we clicked on
        hits[i].object.material.color.set(0xff0000);
      }
      renderer.render(scene, camera);
  } else {
    document.body.style.cursor = '';
    circle1.material.color.set(0xffff00);
    circle2.material.color.set(0xffff00);
    circle3.material.color.set(0xffff00);
  }
}

// Raycast when click
function onClick (event) {
    watchMouse(event)
    if (hits[0]) {
      // get the current camera position
      const { x, y, z } = camera.position
      const start = new THREE.Vector3(x, y, z)
			const item = hits[0]

      var point = item.point;
      var camDistance = camera.position.length();
      camera.position.copy(point).normalize().multiplyScalar(camDistance);
      // controls.update();

      // save the camera position
      const { x: a, y: b, z: c } = camera.position

      // invert back to original position
      camera.position.copy(start).normalize().multiplyScalar(camDistance)

      // animate from start to end
      TweenMax.to(camera.position, 1, { x: a, y: b, z: c, onUpdate: () => {
          controls.update()
        }
      });
    }
}

function watchMouse (event) {
  // Get mouse position in screen space
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // Only raycast if not panning (optimization)
  if (useRaycast) {
      raygun.setFromCamera(mouse, camera);

      // Raycast to single object
      hits = raygun.intersectObjects([circle1, circle2, circle3], false);

      // Raycast to multiple objects
      // hits = raygun.intersectObjects([myTargetObect, myTargetObect2]);
  }
}

window.addEventListener('mousemove', throttle((event) => {onMouseMove(event)}, 150), false);
window.addEventListener('click', onClick, false);
