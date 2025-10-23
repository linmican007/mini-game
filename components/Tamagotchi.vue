<template>
  <div class="tamagotchi-card" :class="theme">
    <!-- 顶部标题 -->
    <div class="header">
      天才音乐人的饲养日常
      <button @click="$emit('toggle-theme')" class="theme-toggle" v-html="themeIconSvg"></button>
    </div>

    <!-- 状态栏 -->
    <div class="status-bars">
      <div class="bar" v-for="(attr, key) in attributes" :key="key">
        <div class="bar-info">
          <span class="bar-title">{{ attr.label }}</span>
          <span class="bar-display">{{ Math.floor(petState[key as keyof typeof attributes] || 0) }}</span>
        </div>
        <div class="bar-visualization">
          <div class="bar-fill" :style="{ width: (petState[key as keyof typeof attributes] || 0) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 当前文字状态 -->
    <div class="status-text">
      <p>{{ statusText }}</p>
    </div>

    <!-- 交互对话栏 -->
    <div class="dialogue-box">
      <p>"{{ displayedDialogue }}"</p>
    </div>

    <!-- 互动按钮区 -->
    <div class="actions">
      <div v-if="!petState.isSleeping">
        <!-- 主按钮区域 -->
        <div class="main-actions" v-if="!showSubActions">
          <button @click="toggleMenu('feed')" :disabled="areInteractionButtonsDisabled">喂食 </button>
          <button @click="toggleMenu('clean')" :disabled="areInteractionButtonsDisabled">清洁 </button>
          <button @click="toggleMenu('play')" :disabled="areInteractionButtonsDisabled">玩耍 </button>
          <button @click="handleSleep" :disabled="isSleepButtonDisabled">睡觉 </button>
        </div>

        <!-- 二级菜单区域 -->
        <div class="sub-actions" v-if="showSubActions">
          <template v-if="activeMenu === 'feed'">
            <button @click="handleFeed('基础饲料')">基础饲料</button>
            <button @click="handleFeed('热汤面')">热汤面</button>
            <button @click="handleFeed('一坨糊糊')">一坨糊糊</button>
          </template>
          <template v-if="activeMenu === 'clean'">
            <button @click="handleClean('打扫')">打扫</button>
            <button @click="handleClean('洗澡')">洗澡</button>
            <button @click="handleClean('梳毛')">梳毛</button>
          </template>
          <template v-if="activeMenu === 'play'">
            <button @click="handlePlay('小吉他')">小吉他</button>
            <button @click="handlePlay('玩游戏')">玩游戏</button>
            <button @click="handlePlay('翻花绳')">翻花绳</button>
          </template>
          <button @click="backToMainActions" class="back-btn" v-html="backIconSvg"></button>
        </div>
      </div>
      <div v-else>
        <button @click="wakeUp" class="wakeup-btn">叫醒</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { usePetState, PetState, TIRED_DIALOGUE } from '../games/tamagotchi';

const props = defineProps<{ theme: string }>();
defineEmits(['toggle-theme']);

const themeIconSvg = computed(() => {
  if (props.theme === 'day-mode') {
    return `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"> <path d="M13 0h-2v4h2V0ZM0 11v2h4v-2H0Zm24 0v2h-4v-2h4ZM13 24h-2v-4h2v4ZM8 6h8v2H8V6ZM6 8h2v8H6V8Zm2 10v-2h8v2H8Zm10-2h-2V8h2v8Zm2-14h2v2h-2V2Zm0 2v2h-2V4h2Zm2 18h-2v-2h2v2Zm-2-2h-2v-2h2v2ZM4 2H2v2h2v2h2V4H4V2ZM2 22h2v-2h2v-2H4v2H2v2Z"/> </svg>`;
  }
  if (props.theme === 'night-mode') {
    return `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"> <path d="M6 2h8v2h-2v2h-2V4H6V2ZM4 6V4h2v2H4Zm0 10H2V6h2v10Zm2 2H4v-2h2v2Zm2 2H6v-2h2v2Zm10 0v2H8v-2h10Zm2-2v2h-2v-2h2Zm-2-4h2v4h2v-8h-2v2h-2v2Zm-6 0v2h6v-2h-6Zm-2-2h2v2h-2v-2Zm0 0V6H8v6h2Z"/> </svg>`;
  }
  // gray-mode
  return `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 4h-6v2H8v2H4v2H2v2H0v6h2v2h20v-2h2v-6h-2v-2h-2V8h-2V6h-2V4zm2 8h4v6H2v-6h2v-2h4v2h2v-2H8V8h2V6h6v2h2v4zm0 0v2h-2v-2h2z" fill="currentColor"/> </svg>`;
});

const backIconSvg = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 4h2v2H8V4zm10 6V8H8V6H6v2H4v2h2v2h2v2h2v-2H8v-2h10zm0 8v-8h2v8h-2zm0 0v2h-6v-2h6z" fill="currentColor"/> </svg>`;

const { petState, statusText, currentDialogue, normalDialogue, feed, clean, play, sleep, wakeUp, checkTempDisplay } = usePetState();
const activeMenu = ref<'feed' | 'clean' | 'play' | null>(null);
const showSubActions = ref(false);
const isSleepButtonDisabled = ref(false);
const areInteractionButtonsDisabled = ref(false);

// 打字机动画相关
const displayedDialogue = ref('');
const isTyping = ref(false);
const typingTimer = ref<number | null>(null);

// 打字机效果
function typeWriter(text: string, callback?: () => void) {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }

  isTyping.value = true;
  displayedDialogue.value = '';
  let index = 0;

  function typeChar() {
    if (index < text.length) {
      displayedDialogue.value += text[index];
      index++;
      typingTimer.value = setTimeout(typeChar, 50); // 每50ms显示一个字符
    } else {
      isTyping.value = false;
      if (callback) callback();
    }
  }

  typeChar();
}

// 监听对话变化
watch(currentDialogue, (newDialogue) => {
  if (newDialogue && newDialogue !== displayedDialogue.value) {
    typeWriter(newDialogue);
  }
}, { immediate: true });

// 定期检查临时显示状态
setInterval(() => {
  checkTempDisplay();
}, 1000);

const attributes = reactive({
  fullness: { label: '饱腹度' },
  happiness: { label: '心情值' },
  cleanliness: { label: '清洁度' },
  energy: { label: '体力值' },
});



function toggleMenu(menu: 'feed' | 'clean' | 'play') {
  // 体力检查由 handleInteraction 函数处理，这里不需要重复检查
  activeMenu.value = menu;
  showSubActions.value = true;
}

function backToMainActions() {
  activeMenu.value = null;
  showSubActions.value = false;
}

function handleFeed(item: '基础饲料' | '热汤面' | '一坨糊糊') {
  feed(item);
  backToMainActions();
}

function handleClean(item: '打扫' | '洗澡' | '梳毛') {
  clean(item);
  backToMainActions();
}

function handlePlay(item: '小吉他' | '玩游戏' | '翻花绳') {
  play(item);
  backToMainActions();
}

function handleSleep() {
  if (!sleep()) {
    isSleepButtonDisabled.value = true;
    setTimeout(() => {
      isSleepButtonDisabled.value = false;
    }, 2000);
  }
  backToMainActions();
}
</script>
