<template>
  <div class="loader-container">
    <div class="loading-text" ref="loadingText">
      <!-- 动态生成的跳跃文字将插入这里 -->
    </div>
    <div class="loading-bar-container">
      <div class="loading-bar" :style="{ width: `${progress}%` }"></div>
    </div>
    <div class="loading-status" v-if="loadingStatus">
      {{ loadingStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const progress = ref(0);
const loadingText = ref<HTMLElement>();
const loadingStatus = ref('');

// 随机加载文字
const loadingMessages = ['正在召唤方亦楷...', '方亦楷奔跑中...'];

// 设置跳跃文字动画
function setupJumpingText() {
  if (!loadingText.value) return;

  const message = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  loadingText.value.innerHTML = ''; // 清空容器

  message.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.animationDelay = `${index * 0.07}s`;
    loadingText.value!.appendChild(span);
  });
}

// 更新进度
function updateProgress(newProgress: number) {
  progress.value = newProgress;
}

// 设置加载状态信息
function setLoadingStatus(status: string) {
  loadingStatus.value = status;
}

// 清除加载状态信息
function clearLoadingStatus() {
  loadingStatus.value = '';
}

onMounted(() => {
  setupJumpingText();
});

// 暴露方法给父组件
defineExpose({
  updateProgress,
  setLoadingStatus,
  clearLoadingStatus
});
</script>
