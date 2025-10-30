<template>
  <div class="app-container" :class="theme">
    <transition name="pop" mode="out-in">
      <!-- 加载界面 -->
      <div v-if="scene === 'loading'" key="loading" class="main-container">
        <Loader ref="loaderRef" />
      </div>
      <!-- 主菜单 -->
      <div v-else-if="scene === 'start'" key="start" class="main-container">
        <div class="title-section">
          <img src="https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDrUZo-Y8rK7CuT3MRrhzKBc-whRKtaAACtxcAAoqN0FduqntTYLwOuDYE.png" alt="小游戏" class="title-image" />
        </div>
        <div class="games-grid">
          <button class="game-btn" @click="scene = 'tamagotchi'">
            <div class="btn-content">
              <div class="btn-icon" v-html="tamagotchiIcon"></div>
              <div class="btn-text-container">
                <span class="btn-text">拓麻歌子</span>
                <span class="btn-subtitle">震惊！某知名音乐人竟然变成了电子宠物……</span>
              </div>
            </div>
          </button>
          <button class="game-btn" @click="scene = 'rps'">
            <div class="btn-content">
              <div class="btn-icon" v-html="rpsIcon"></div>
              <div class="btn-text-container">
                <span class="btn-text">猜拳</span>
                <span class="btn-subtitle">要来一场让人冷汗直流的智力对决吗？</span>
              </div>
            </div>
          </button>
          <button class="game-btn disabled" disabled>
            <div class="btn-content">
              <div class="btn-icon" v-html="otherIcon"></div>
              <div class="btn-text-container">
                <span class="btn-text">其他</span>
                <span class="btn-subtitle">coming soon……</span>
              </div>
            </div>
          </button>
        </div>
      </div>
      <div v-else-if="scene === 'rps'" key="rps" class="game-container">
        <RockPaperScissors @game-over="handleGameOver" />
      </div>
      <div v-else-if="scene === 'tamagotchi'" key="tamagotchi" class="tamagotchi-container">
        <Tamagotchi :theme="theme" @toggle-theme="toggleTheme" />
        <div class="mt-4 text-center">
          <button class="btn" @click="scene = 'start'">返回首页</button>
        </div>
      </div>
      <div v-else-if="scene === 'end'" key="end" class="game-container">
        <EndScreen
          :player-score="finalPlayerScore"
          :ai-score="finalAiScore"
          @restart="scene = 'rps'"
          @back-to-menu="scene = 'start'"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import RockPaperScissors from './components/RockPaperScissors.vue';
import Tamagotchi from './components/Tamagotchi.vue';
import EndScreen from './components/EndScreen.vue';
import Loader from './components/Loader.vue';
import { startLoading, onLoadingProgress, onLoadingComplete, onLoadingStatus, onLoadingClearStatus } from './games/loader';

const scene = ref('loading');
const loaderRef = ref<InstanceType<typeof Loader>>();
const theme = ref('day-mode');
const finalPlayerScore = ref(0);
const finalAiScore = ref(0);

// SVG图标
const tamagotchiIcon = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.41003 16.75C4.17003 19.64 6.35003 22 9.25003 22H14.04C17.3 22 19.54 19.37 19 16.15C18.43 12.77 15.17 10 11.74 10C8.02003 10 4.72003 13.04 4.41003 16.75Z" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.47 7.5C11.8507 7.5 12.97 6.38071 12.97 5C12.97 3.61929 11.8507 2.5 10.47 2.5C9.08926 2.5 7.96997 3.61929 7.96997 5C7.96997 6.38071 9.08926 7.5 10.47 7.5Z" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17.3 8.69995C18.4046 8.69995 19.3 7.80452 19.3 6.69995C19.3 5.59538 18.4046 4.69995 17.3 4.69995C16.1955 4.69995 15.3 5.59538 15.3 6.69995C15.3 7.80452 16.1955 8.69995 17.3 8.69995Z" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21 12.7C21.8284 12.7 22.5 12.0284 22.5 11.2C22.5 10.3715 21.8284 9.69995 21 9.69995C20.1716 9.69995 19.5 10.3715 19.5 11.2C19.5 12.0284 20.1716 12.7 21 12.7Z" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.96997 10.7C5.07454 10.7 5.96997 9.80452 5.96997 8.69995C5.96997 7.59538 5.07454 6.69995 3.96997 6.69995C2.8654 6.69995 1.96997 7.59538 1.96997 8.69995C1.96997 9.80452 2.8654 10.7 3.96997 10.7Z" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const rpsIcon = `<svg width="800px" height="800px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5472">
<path d="M522.666667 160a42.666667 42.666667 0 0 1 42.666666 42.666667V256a32 32 0 0 0 64 0 42.666667 42.666667 0 1 1 85.333334 0v95.872a32 32 0 0 0 64 0.042667 42.666667 42.666667 0 0 1 85.333333 0V640c0 33.024-16.426667 73.045333-45.866667 112.085333-29.013333 38.570667-68.266667 72.789333-108.117333 94.464-114.432 62.336-246.272 48.810667-313.429333 20.053334-34.816-14.933333-95.146667-47.658667-146.261334-97.493334C199.381333 719.36 160 655.146667 160 576c0-29.226667 19.754667-54.613333 52.053333-76.373333 31.573333-21.248 68.096-34.048 85.504-39.381334 19.072-5.802667 33.109333-23.466667 33.109334-44.501333V256a42.666667 42.666667 0 1 1 85.333333 0 32 32 0 0 0 64 0V202.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z m98.688 2.133333a106.666667 106.666667 0 0 0-197.376 0A106.666667 106.666667 0 0 0 266.666667 256v146.986667c-22.442667 7.594667-57.856 21.674667-90.325334 43.562666-38.528 25.941333-80.341333 68.096-80.341333 129.450667 0 102.186667 51.285333 181.930667 109.653333 238.933333 58.24 56.789333 125.909333 93.44 165.76 110.506667 82.218667 35.2 234.922667 50.474667 369.237334-22.656 48.298667-26.325333 94.378667-66.730667 128.597333-112.213333 33.877333-44.928 58.752-98.261333 58.752-150.570667V351.914667a106.581333 106.581333 0 0 0-149.333333-97.706667A106.666667 106.666667 0 0 0 621.354667 162.133333z" p-id="5473" fill="#5a3e2b"></path></svg>`;

const otherIcon = `<svg t="1761164661356" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="33904" width="200" height="200"><path d="M214.699873 512m-87.440491 0a85.449 85.449 0 1 0 174.880983 0 85.449 85.449 0 1 0-174.880983 0ZM809.300127 512m-87.440491 0a85.449 85.449 0 1 0 174.880983 0 85.449 85.449 0 1 0-174.880983 0ZM512.005117 512m-87.440491 0a85.449 85.449 0 1 0 174.880983 0 85.449 85.449 0 1 0-174.880983 0Z" fill="#5a3e2b" p-id="33905"></path></svg>`;

const themes = ['day-mode', 'night-mode', 'gray-mode'];
let currentThemeIndex = 0;

function toggleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  theme.value = themes[currentThemeIndex];
}

function handleGameOver(scores: { playerScore: number; aiScore: number }) {
  finalPlayerScore.value = scores.playerScore;
  finalAiScore.value = scores.aiScore;
  scene.value = 'end';
}

// 初始化加载逻辑
onMounted(() => {
  // 注册加载进度回调
  onLoadingProgress((progress) => {
    if (loaderRef.value) {
      loaderRef.value.updateProgress(progress);
    }
  });

  // 注册加载完成回调
  onLoadingComplete(() => {
    // 延迟一下让用户看到100%的进度条
    setTimeout(() => {
      scene.value = 'start';
    }, 500);
  });

  // 注册状态更新回调
  onLoadingStatus((status) => {
    if (loaderRef.value) {
      loaderRef.value.setLoadingStatus(status);
    }
  });

  // 注册清除状态回调
  onLoadingClearStatus(() => {
    if (loaderRef.value) {
      loaderRef.value.clearLoadingStatus();
    }
  });

  // 开始加载
  startLoading();
});
</script>
