<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  MeshStandardMaterial, Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, AmbientLight, PlaneGeometry, TextureLoader, Mesh, MeshBasicMaterial, Object3D, BoxGeometry, Vector3,
} from 'three';
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { showImagePreview } from 'vant';
import gsap from 'gsap';
import { CSSRulePlugin } from "gsap/CSSRulePlugin";
import { getAllSlots } from './utils';
import Sticks from './components/Sticks.vue';
import pc1 from './assets/images/p1.jpg';
import pc2 from './assets/images/p2.jpg';
import pc3 from './assets/images/p3.jpg';
import pc4 from './assets/images/p4.jpg';
import pc5 from './assets/images/p5.jpg';
import pc6 from './assets/images/p6.jpg';
import sceneGlb from './assets/scene.glb';

console.log(sceneGlb)

gsap.registerPlugin(CSSRulePlugin);

interface Move {
  x: number;
  y: number;
}

// interface Painting {
//   name: string;
//   url: string;
//   description: string;
// }

const IMG_URLS = [pc1, pc2, pc3, pc4, pc5, pc6];
// const paintingList = {

// }

const cameraControl = ref();
const container = ref<HTMLDivElement | null>(null);
const scene = new Scene();

const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);

camera.position.z = 10;
camera.position.y = 2;
// camera.rotation.set(0, 0, 0);
// camera.lookAt(0, 2, 10);


const light = new DirectionalLight(0xffffff, 1);
// 灯光自顶向下照射
light.position.set(0, 1, 0);
scene.add(light);

const ambientLight = new AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const width = 20;
const height = 20;
const intensity = 3;
const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
rectLight.position.set(0, 15, 0);
rectLight.lookAt(0, 0, 0);
scene.add(rectLight)
// const width = 20;
// const height = 3;
// const intensity = 3;
// const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
// rectLight.position.set(0, 5, 5);
// rectLight.lookAt(0, 5, 10);
// scene.add(rectLight)
// const rectLight2 = new THREE.RectAreaLight(0xffffff, intensity, width, height);
// rectLight2.position.set(0, 5, -5);
// rectLight2.lookAt(0, 5, -10);
// scene.add(rectLight2)

const moveSpeed = 1;

const handleMove = (move: Move) => {
  // camera.position.x += move.x * moveSpeed;
  // camera.position.z += move.y * moveSpeed;
  // gsap 移动相机
  const forward = new Vector3();
  camera.getWorldDirection(forward);
  // 相机本地坐标系的前方向
  const forwardXZ = new Vector3(forward.x, 0, forward.z).normalize();
  const right = new Vector3(-forward.z, 0, forward.x).normalize();
  const offset = forwardXZ.multiplyScalar(move.y * moveSpeed).add(right.multiplyScalar(move.x * moveSpeed));
  gsap.to(camera.position, {
    x: camera.position.x + offset.x,
    y: camera.position.y + offset.y,
    z: camera.position.z + offset.z,
    duration: 0.1,
  });
  // cameraControl.value?.update();
}

const genPainting = (index: number, slot: Object3D) => {
  if (!slot) return;

  const paintingWidth = 4;
  const frameWidth = 0.4 + paintingWidth;
  const texture = new TextureLoader().load(IMG_URLS[index], (data) => {

    // 画框
    const ratio = data.image.width / data.image.height;
    // 在 slot3 位置生成一个 Box
    const geometry = new BoxGeometry(frameWidth, frameWidth / ratio, 0.5);
    const material = new MeshStandardMaterial({ color: 0xfbdb7f, roughness: 0.2, metalness: 0.2 });
    const cube = new Mesh(geometry, material);
    cube.position.set(slot.position.x, slot.position.y, slot.position.z);
    scene.add(cube);

    // 画作
    const planeMat = new MeshBasicMaterial({ map: texture, });
    const plane = new PlaneGeometry(paintingWidth, paintingWidth / ratio);
    const mesh = new Mesh(plane, planeMat);
    // 计算 slot 的 正 z 方向
    const forward = new Vector3();
    slot.getWorldDirection(forward);
    const offset = forward.multiplyScalar(0.27);
    mesh.position.set(slot.position.x + offset.x, slot.position.y + offset.y, slot.position.z + offset.z);
    // mesh 旋转到 slot 的正 z 方向
    if (index > 2) {
      mesh.rotateY(Math.PI);
    }
    mesh.name = 'painting' + index;
    scene.add(mesh);

    // 文字
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {

      var geometry = new TextGeometry('Artwork ' + (index + 1 + '\n\nHere is description'), {
        font: font,
        size: 0.3,
        depth: 0,
      });

      var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      var text = new THREE.Mesh(geometry, material);
      let offsetX = frameWidth / 2 + 0.3;
      if (index > 2) {
        offsetX = -offsetX;
      }
      text.position.set(slot.position.x + offsetX, slot.position.y + 1, slot.position.z);
      if (index > 2) {
        text.rotateY(Math.PI);
      }
      scene.add(text);
    });
  }
  );
}

const handlePaintingClick = (index: number) => {
  showImagePreview({
    images: [
      IMG_URLS[index]
    ], closeable: true,
  });
}

const resetCamera = () => {
  // camera.position.set(0.54, 0.6, 10);
  gsap.to(camera.position, {
    x: 0.54,
    y: 0.6,
    z: 10,
    duration: 0.3,
  });
  gsap.to(camera.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration: 0.3,
  });
};

const handleDrag = (props: any) => {
  // console.log("handle drag", props);
  handleMove(props);
}

onMounted(() => {
  const renderer = new WebGLRenderer();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.value?.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  cameraControl.value = controls;
  // // controls.autoRotate = true;
  // camera.rotation.set(0, 0, 0);
  // controls.update();
  // camera.lookAt(0, 2, -10);
  controls.maxPolarAngle = Math.PI / 2 - 0.1;
  // controls.enableZoom = false;

  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  const loader = new GLTFLoader();

  loader.load(sceneGlb, function (gltf) {
    // standard material
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new MeshStandardMaterial({
          metalness: 0.1,
          roughness: 0.5,
        });
      }
    });
    const slots = getAllSlots(gltf.scene);

    slots.forEach((slot, index) => {
      genPainting(index, slot);
    });

    scene.add(gltf.scene);
  }, undefined, function (error) {
    console.error(error);
  });


  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });


  // 监听键盘wasd事件调用handleMove
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'w':
        handleMove({ x: 0, y: 1 });
        break;
      case 'a':
        handleMove({ x: -1, y: 0 });
        break;
      case 's':
        handleMove({ x: 0, y: -1 });
        break;
      case 'd':
        handleMove({ x: 1, y: 0 });
        break;
    }
  });

  window.addEventListener('click', (e) => {
    // 判断是否点击到了画作
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      if (intersects[0].object.name.includes('painting')) {
        const index = parseInt(intersects[0].object.name.replace('painting', ''));
        handlePaintingClick(index);
      }
    }
  });

});



// const debug = () => {
//   console.log(camera);
// }

</script>

<template>
  <div>
    <!-- <button @click="debug" class="debug">debug</button> -->
    <button @click="resetCamera" class="reset">重置相机</button>
    <div ref="container" class="container">
    </div>
    <Sticks @ondrag="handleDrag" />
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}

.debug {
  position: fixed;
  top: 12px;
  right: 130px;
  z-index: 100;
}

.reset {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 100;
}

button {
  background-color: #3172ff;
  border: none;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 12px;
  padding: 8px 20px;
  transition: background-color 0.15s;
}

button:hover {
  background-color: #5e8ef5;
}

button:active {
  background-color: #1a5ae6;
}
</style>
