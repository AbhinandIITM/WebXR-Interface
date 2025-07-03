import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color('skyblue');

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444));

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 6),
  new THREE.MeshStandardMaterial({ color: 'white' })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Logger Panel
const logPanel = new THREE.Group();
logPanel.position.set(1, 0.5, -1.5);
scene.add(logPanel);

const logBackground = new THREE.Mesh(
  new THREE.PlaneGeometry(1.2, 0.4),
  new THREE.MeshBasicMaterial({ color: 'black', transparent: true, opacity: 0.7 })
);
logPanel.add(logBackground);

const logMessages = [];
const maxLogs = 5;
const logTextMesh = new THREE.Object3D();
logPanel.add(logTextMesh);

const fontLoader = new FontLoader();
let loadedFont = null;

fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
  loadedFont = font;
  updateLogDisplay();
});

function logToVR(message) {
  logMessages.push(message);
  if (logMessages.length > maxLogs) logMessages.shift();
  
  updateLogDisplay();
}

function updateLogDisplay() {
  if (!loadedFont) return;
  logTextMesh.clear();

  logMessages.forEach((msg, i) => {
    const textGeo = new TextGeometry(msg, {
      font: loadedFont,
      size: 0.04,
      height: 0.0001, // small depth
      depth:0.01,
      curveSegments: 4,
      bevelEnabled: false
    });

    // Move text so back of text aligns with Z=0 (flush with logger)
    textGeo.computeBoundingBox();
    const bbox = textGeo.boundingBox;
    const zShift = bbox.min.z; // typically negative
    textGeo.translate(0, 0, zShift); // push text forward so its back is flush

    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(textGeo, mat);
    mesh.position.set(-0.55, 0.15 - i * 0.08, 0); // Keep Z at 0 now

    logTextMesh.add(mesh);
  });
}


// UI Panel
const panel = new THREE.Group();
panel.position.set(0, 1.5, -1.5);
scene.add(panel);

function createButton(label, defaultColor, activeColor, onClick) {
  const geom = new THREE.BoxGeometry(0.4, 0.2, 0.05);
  const mat = new THREE.MeshStandardMaterial({ color: defaultColor });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.userData = {
    label,
    defaultColor,
    activeColor,
    isActive: false,
    onClick,
    clicked: false
  };
  return mesh;
}

const buttons = [];

const gripBtn = createButton("Toggle Grip", "green", "red", (btn) => {
  btn.userData.isActive = !btn.userData.isActive;
  btn.material.color.set(btn.userData.isActive ? btn.userData.activeColor : btn.userData.defaultColor);
  logToVR("Command 2 Sent.");
});
gripBtn.position.set(0, 0, 0);
panel.add(gripBtn);
buttons.push(gripBtn);

const commandBtn = createButton("Send Command", "blue", "yellow", (btn) => {
  btn.userData.isActive = !btn.userData.isActive;
  btn.material.color.set(btn.userData.isActive ? btn.userData.activeColor : btn.userData.defaultColor);
  logToVR("Command 1 sent");
});
commandBtn.position.set(0, -0.3, 0);
panel.add(commandBtn);
buttons.push(commandBtn);

// Load GLB Button
const gltfLoader = new GLTFLoader();
gltfLoader.load('models/b4.glb', (gltf) => {
  const glbButton = gltf.scene;
  glbButton.name = 'GLB_SOS_Button';
  glbButton.position.set(0, -0.4, 0.1);
  glbButton.rotation.set(-80,0,0),
  glbButton.scale.set(20, 20, 20);

  glbButton.userData = {
    label: 'GLB SOS',
    isActive: false,
    onClick: (btn) => {
      btn.userData.isActive = !btn.userData.isActive;
      if (glbButton.position.z ==0.1){
      glbButton.position.set(0,-0.4,-0.1)
      }
      else if(glbButton.position.z ==-0.1){
      glbButton.position.set(0,-0.4,0.1)
      }
      logToVR('GLB SOS toggled');
    },
    clicked: false
  };

  glbButton.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  panel.add(glbButton);
  buttons.push(glbButton);
  logToVR('GLB SOS model loaded');
});

// Controller Setup
const rayMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const rayGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -1)
]);

function setupController(index) {
  const controller = renderer.xr.getController(index);
  controller.userData.selectPressed = false;
  const ray = new THREE.Line(rayGeometry.clone(), rayMaterial.clone());
  ray.name = 'ray';
  controller.add(ray);
  scene.add(controller);

  controller.addEventListener('selectstart', () => controller.userData.selectPressed = true);
  controller.addEventListener('selectend', () => controller.userData.selectPressed = false);

  return controller;
}

const controllers = [setupController(0), setupController(1)];

const controllerModelFactory = new XRControllerModelFactory();
[0, 1].forEach(i => {
  const grip = renderer.xr.getControllerGrip(i);
  grip.add(controllerModelFactory.createControllerModel(grip));
  scene.add(grip);
});

// Raycaster
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

function getRootButton(obj) {
  while (obj && !obj.userData.onClick && obj.parent) obj = obj.parent;
  return obj;
}

// Animation Loop
renderer.setAnimationLoop(() => {
  buttons.forEach(btn => {
    if (btn.material?.emissive) btn.material.emissive.set(0x000000);
  });

  controllers.forEach(controller => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(buttons, true);
    const rayLine = controller.getObjectByName('ray');
    rayLine.scale.z = 5;

    if (intersects.length > 0) {
      const target = intersects[0].object;
      const root = getRootButton(target);
      if (root?.material?.emissive) root.material.emissive.set(0x333333);
      rayLine.scale.z = intersects[0].distance;

      if (controller.userData.selectPressed && !root.userData.clicked) {
        root.userData.onClick(root);
        root.userData.clicked = true;
      } else if (!controller.userData.selectPressed) {
        root.userData.clicked = false;
      }
    }
  });

  renderer.render(scene, camera);
});