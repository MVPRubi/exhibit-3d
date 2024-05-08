<template>
  <div>
    <canvas ref="canvas" @mousedown="startDragging" @touchstart="startDragging" @mousemove="drag" @touchmove="drag"
      @mouseup="stopDragging" @touchend="stopDragging"></canvas>
    <!-- {{ direction }} -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';

const emit = defineEmits(['ondrag']);
const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const width = 200;
const height = 200;
const radius = width / 4;
const centerX = width / 2;
const centerY = height / 2;
let x = centerX;
let y = centerY;
let isDragging = false;
const direction = ref<number | null>(null);

function draw() {
  if (!context.value || !canvas.value) return;
  context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // 绘制摇杆底座
  context.value.beginPath();
  context.value.arc(
    canvas.value.width / 2,
    canvas.value.height / 2,
    radius * 1.5,
    0,
    2 * Math.PI,
    false,
  );
  context.value.fillStyle = '#6464641a';
  context.value.fill();
  context.value.lineWidth = 2;
  context.value.strokeStyle = 'rgba(100,100,100,0.8)';
  context.value.stroke();

  // 绘制四个箭头
  const arrowLength = 6;
  const arrowAngle = Math.PI / 6;
  context.value.save();
  context.value.translate(centerX, centerY);
  for (let i = 0; i < 4; i++) {
    context.value.beginPath();
    context.value.rotate((Math.PI / 2) * i);
    // context.value.moveTo(radius - arrowLength, 0);
    context.value.lineTo(radius * 1.4, 0);
    context.value.lineTo(
      radius * 1.4 - arrowLength * Math.cos(arrowAngle),
      arrowLength * Math.sin(arrowAngle),
    );
    context.value.moveTo(radius * 1.4, 0);
    context.value.lineTo(
      radius * 1.4 - arrowLength * Math.cos(arrowAngle),
      -arrowLength * Math.sin(arrowAngle),
    );
    // context.value.strokeStyle = '#c6c9cd';
    context.value.strokeStyle = 'rgba(100,100,100,1)';
    context.value.stroke();
  }
  context.value.restore();

  // 绘制内圈背景
  context.value.beginPath();
  context.value.arc(
    canvas.value.width / 2,
    canvas.value.height / 2,
    radius * 1.2,
    0,
    2 * Math.PI,
    false,
  );
  context.value.fillStyle = 'rgba(100,100,100,0.4)';
  context.value.fill();
  context.value.lineWidth = 0;

  // 绘制内圈
  context.value.beginPath();
  context.value.arc(
    canvas.value.width / 2,
    canvas.value.height / 2,
    radius / 1.6,
    0,
    2 * Math.PI,
    false,
  );
  context.value.lineWidth = 1;
  context.value.strokeStyle = 'rgba(100,100,100,1)';
  context.value.stroke();

  // 绘制中心圆圈
  context.value.beginPath();
  context.value.arc(x, y, radius / 2.2, 0, 2 * Math.PI, false);
  context.value.fillStyle = '#fff';
  context.value.fill();
  //   context.value.lineWidth = 2;
  //   context.value.strokeStyle = '#fff';
  //   context.value.stroke();
  // console.log('弧度：', getDirection());
  // console.log('角度：', getDirection2());
  // console.log('方向：', getDirection3());
  // console.log('-------------');

  const dir = getDirection2();

  const offset = {
    x: dir === 'left' ? -1 : dir === 'right' ? 1 : 0,
    y: dir === 'up' ? 1 : dir === 'down' ? -1 : 0,
  }

  emit('ondrag', offset);
}

function getDirection() {
  const deltaX = x - centerX;
  const deltaY = y - centerY;
  let angle = Math.atan2(deltaY, deltaX);

  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
}

function getDirection2() {
  const deltaX = x - centerX;
  const deltaY = y - centerY;
  let angle = Math.atan2(deltaY, deltaX);

  // 将弧度转换为角度
  angle *= 180 / Math.PI;
  let direction = '';

  if (angle > -135 && angle < -45) {
    direction = 'up';
  } else if (angle > -45 && angle < 45) {
    direction = 'right';
  } else if (angle > 45 && angle < 135) {
    direction = 'down';
  } else {
    direction = 'left';
  }
  return direction;
}

function getDirection3() {
  const deltaX = x - centerX;
  const deltaY = y - centerY;
  let angle = Math.atan2(deltaY, deltaX);

  if (angle < 0) {
    angle += 2 * Math.PI;
  }

  const direction = (angle * 180) / Math.PI;

  return direction;
}
function startDragging(e: MouseEvent | TouchEvent) {
  isDragging = true;
  e.preventDefault();
}

function drag(e: any) {
  if (!canvas.value) return;

  if (isDragging) {
    if (e.type === 'touchmove') {
      x = e.touches[0].clientX - canvas.value.offsetLeft;
      y = e.touches[0].clientY - canvas.value.offsetTop;
    } else {
      x = e.clientX - canvas.value.offsetLeft;
      y = e.clientY - canvas.value.offsetTop;
    }

    // 限制摇杆的移动范围
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
    );
    if (distance > radius) {
      const angle = Math.atan2(y - centerY, x - centerX);
      x = centerX + radius * Math.cos(angle);
      y = centerY + radius * Math.sin(angle);
    }

    direction.value = getDirection();

    draw();
  }
}

function stopDragging() {
  isDragging = false;
  x = centerX;
  y = centerY;
  direction.value = null;
  draw();
}

// 初始化画布和绘制摇杆
function init() {
  if (!canvas.value) return;
  canvas.value.width = width;
  canvas.value.height = height;
  context.value = canvas.value.getContext('2d');
  draw();
}
onMounted(() => {
  init();
});
</script>


<style lang="less" scoped>
canvas {
  position: fixed;
  bottom: 20px;
  left: 20px;
}
</style>
