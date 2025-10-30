import { reactive, watch, computed } from 'vue';
import _ from 'lodash';

import { globalTimerManager } from '../utils/timer-manager';
import { SafeStorage } from '../utils/storage';
import { GAME_CONFIG } from '../utils/game-config';

import {
  DIALOGUES,
  TEMP_STATUS_TEXTS,
  NORMAL_DIALOGUES,
  NOT_SLEEPY_DIALOGUE,
  TIRED_DIALOGUE,
  NORMAL_STATUS_OPTIONS,
  STATUS_TEXTS,
  SLEEP_DIALOGUES,
  WAKE_DIALOGUE
} from './tamagotchi-constants';

export { DIALOGUES, TEMP_STATUS_TEXTS, NORMAL_DIALOGUES, NOT_SLEEPY_DIALOGUE, TIRED_DIALOGUE, NORMAL_STATUS_OPTIONS, STATUS_TEXTS, SLEEP_DIALOGUES, WAKE_DIALOGUE };

// 状态结构定义
export interface PetState {
  fullness: number;      // 饱腹度
  happiness: number;     // 心情值
  cleanliness: number;   // 清洁度
  energy: number;        // 体力值
  isSleeping: boolean;   // 是否正在睡觉
  dialogue: string;      // 当前对话
  lastInteractionTime: number; // 上次互动时间
  lastUpdated: number;   // 上次状态更新时间
  inactivityCycles: number; // 无互动周期计数
  isFirstEntry: boolean; // 是否为首次进入游戏
  // 临时状态管理字段
  tempStatusText?: string;  // 临时状态文本
  tempDialogue?: string;    // 临时对话文本
  isTempDisplay?: boolean;  // 是否正在显示临时内容
  tempDisplayStartTime?: number; // 临时显示开始时间
  // 对话更新控制字段
  lastContentUpdateTime?: number; // 上次内容更新时间（对话和状态文本同步）
  currentStatusText?: string; // 当前状态文本（用于时间控制）
}

// 默认状态
const getDefaultState = (): PetState => ({
  fullness: 80,
  happiness: 80,
  cleanliness: 80,
  energy: 100,
  isSleeping: false,
  dialogue: '我操？！这是什么鬼地方？……是你把我弄进这里的？能听到我说话吗？',
  lastInteractionTime: Date.now(),
  lastUpdated: Date.now(),
  inactivityCycles: 0,
  isFirstEntry: true,
});

// 全局状态实例
let petState: PetState;

function loadState(): PetState {
  return SafeStorage.getItem(GAME_CONFIG.STORAGE.PET_STATE_KEY, getDefaultState());
}

function saveState(state: PetState): void {
  SafeStorage.setItem(GAME_CONFIG.STORAGE.PET_STATE_KEY, state);
}

// 确保只在客户端执行
if (typeof window !== 'undefined') {
  petState = reactive<PetState>(loadState());
  watch(() => petState, saveState, { deep: true });

  // 使用定时器管理器设置状态更新定时器
  globalTimerManager.setInterval('pet-state-update', updateState, GAME_CONFIG.TIMING.STATE_UPDATE_INTERVAL);
}

// 计算当前应该显示的状态文本
function calculateCurrentStatusText(): string {
  if (petState.isSleeping) return STATUS_TEXTS.sleeping;
  // depressed状态优先级最高，心情值为0时始终优先触发
  if (petState.happiness === GAME_CONFIG.ATTRIBUTES.CRITICAL_HAPPINESS) {
    return _.sample(Array.isArray(STATUS_TEXTS.depressed) ? STATUS_TEXTS.depressed : [STATUS_TEXTS.depressed])!;
  }
  if (petState.energy < GAME_CONFIG.ATTRIBUTES.LOW_ENERGY_THRESHOLD) {
    return _.sample(Array.isArray(STATUS_TEXTS.energyLow) ? STATUS_TEXTS.energyLow : [STATUS_TEXTS.energyLow])!;
  }
  if (petState.happiness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
    return _.sample(Array.isArray(STATUS_TEXTS.bored) ? STATUS_TEXTS.bored : [STATUS_TEXTS.bored])!;
  }
  if (petState.cleanliness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
    return _.sample(Array.isArray(STATUS_TEXTS.dirty) ? STATUS_TEXTS.dirty : [STATUS_TEXTS.dirty])!;
  }
  if (petState.fullness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
    return _.sample(Array.isArray(STATUS_TEXTS.hungry) ? STATUS_TEXTS.hungry : [STATUS_TEXTS.hungry])!;
  }
  return _.sample(NORMAL_STATUS_OPTIONS)!;
}

// 全局临时显示函数
function setTempDisplay(statusText?: string, dialogue?: string, autoClearDelay?: number) {
  const startTime = Date.now();
  petState.isTempDisplay = true;
  petState.tempDisplayStartTime = startTime;
  if (statusText) {
    petState.tempStatusText = statusText;
  }
  if (dialogue) {
    petState.tempDialogue = dialogue;
  }

  // 如果指定了自动清除延迟，则设置定时器
  if (autoClearDelay && autoClearDelay > 0) {
    setTimeout(() => {
      // 只有当前临时显示仍然是同一个时才清除
      if (petState.isTempDisplay && petState.tempDisplayStartTime === startTime) {
        clearTempDisplay();
      }
    }, autoClearDelay);
  }
}

// 全局清除临时显示函数
function clearTempDisplay() {
  petState.isTempDisplay = false;
  petState.tempStatusText = undefined;
  petState.tempDialogue = undefined;
  petState.tempDisplayStartTime = undefined;
  // 恢复通常对话文本
  const normalDialogue = computeNormalDialogue();
  petState.dialogue = normalDialogue;
  // 更新内容时间戳（对话和状态文本同步）
  petState.lastContentUpdateTime = Date.now();
  petState.currentStatusText = calculateCurrentStatusText();
}

// 辅助函数：计算通常对话文本
function computeNormalDialogue(): string {
  if (petState.isSleeping) return NORMAL_DIALOGUES.sleeping;

  // 抑郁状态优先级最高，心情值为0时始终优先触发
  if (petState.happiness === 0) {
    return _.sample(Array.isArray(NORMAL_DIALOGUES.depressed) ? NORMAL_DIALOGUES.depressed : [NORMAL_DIALOGUES.depressed])!;
  }

  // 收集其他负面状态（排除抑郁状态）
  const negativeStates = [];
  if (petState.fullness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) negativeStates.push('hungry');
  if (petState.happiness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD && petState.happiness !== GAME_CONFIG.ATTRIBUTES.CRITICAL_HAPPINESS) negativeStates.push('bored');
  if (petState.energy < GAME_CONFIG.ATTRIBUTES.LOW_ENERGY_THRESHOLD) negativeStates.push('tired');
  if (petState.cleanliness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) negativeStates.push('dirty');

  // 如果有多个负面状态，随机选择一个显示
  if (negativeStates.length > 1) {
    const randomState = _.sample(negativeStates)!;
    switch (randomState) {
      case 'hungry':
        return _.sample(Array.isArray(NORMAL_DIALOGUES.hungry) ? NORMAL_DIALOGUES.hungry : [NORMAL_DIALOGUES.hungry])!;
      case 'bored':
        return _.sample(Array.isArray(NORMAL_DIALOGUES.bored) ? NORMAL_DIALOGUES.bored : [NORMAL_DIALOGUES.bored])!;
      case 'tired':
        return NORMAL_DIALOGUES.tired;
      case 'dirty':
        return _.sample(Array.isArray(NORMAL_DIALOGUES.dirty) ? NORMAL_DIALOGUES.dirty : [NORMAL_DIALOGUES.dirty])!;
    }
  }

  // 如果只有一个或没有负面状态，按原有逻辑处理
  if (petState.fullness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
    return _.sample(Array.isArray(NORMAL_DIALOGUES.hungry) ? NORMAL_DIALOGUES.hungry : [NORMAL_DIALOGUES.hungry])!;
  }
  if (petState.happiness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
    return _.sample(Array.isArray(NORMAL_DIALOGUES.bored) ? NORMAL_DIALOGUES.bored : [NORMAL_DIALOGUES.bored])!;
  }
  if (petState.energy < GAME_CONFIG.ATTRIBUTES.LOW_ENERGY_THRESHOLD) return NORMAL_DIALOGUES.tired;
  if (petState.cleanliness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
    return _.sample(Array.isArray(NORMAL_DIALOGUES.dirty) ? NORMAL_DIALOGUES.dirty : [NORMAL_DIALOGUES.dirty])!;
  }

  const normalTexts = NORMAL_DIALOGUES.normal;
  return _.sample(normalTexts)!;
}

// 全局状态更新逻辑
function updateState(forceUpdate: boolean = false) {
  if (!petState) return;

  const now = Date.now();
  const elapsedSeconds = (now - petState.lastUpdated) / 1000;

  const previousDialogue = petState.dialogue;
  const wasTempDisplay = petState.isTempDisplay;

  if (petState.isSleeping) {
    petState.energy = Math.min(
      GAME_CONFIG.ATTRIBUTES.MAX_ATTRIBUTE_VALUE,
      petState.energy + elapsedSeconds / GAME_CONFIG.DECAY.SLEEP_ENERGY_RATE
    );
  } else {
    petState.fullness = Math.max(
      GAME_CONFIG.ATTRIBUTES.MIN_ATTRIBUTE_VALUE,
      petState.fullness - elapsedSeconds / GAME_CONFIG.DECAY.FULLNESS_RATE
    );
    petState.cleanliness = Math.max(
      GAME_CONFIG.ATTRIBUTES.MIN_ATTRIBUTE_VALUE,
      petState.cleanliness - elapsedSeconds / GAME_CONFIG.DECAY.CLEANLINESS_RATE
    );
    petState.energy = Math.min(
      GAME_CONFIG.ATTRIBUTES.MAX_ATTRIBUTE_VALUE,
      petState.energy + elapsedSeconds / GAME_CONFIG.DECAY.ENERGY_RECOVERY_RATE
    );

    const timeSinceLastInteraction = (now - petState.lastInteractionTime) / 1000;
    const newCycles = Math.floor(timeSinceLastInteraction / GAME_CONFIG.DECAY.INACTIVITY_CYCLE);

    if (newCycles > petState.inactivityCycles) {
      const cyclesToApply = newCycles - petState.inactivityCycles;

      let happinessDrop = 0;
      for (let i = 0; i < cyclesToApply; i++) {
        const currentCycle = petState.inactivityCycles + i + 1;
        happinessDrop += currentCycle <= GAME_CONFIG.DECAY.HAPPINESS_DROP_THRESHOLD
          ? GAME_CONFIG.DECAY.HAPPINESS_DROP_EARLY
          : GAME_CONFIG.DECAY.HAPPINESS_DROP_LATE;
      }

      petState.happiness = Math.max(GAME_CONFIG.ATTRIBUTES.MIN_ATTRIBUTE_VALUE, petState.happiness - happinessDrop);
      petState.inactivityCycles = newCycles;
    }
  }
  petState.lastUpdated = now;

  // 如果没有临时显示，检查是否需要更新对话文本和状态文本
  if (!petState.isTempDisplay) {
    // 如果是首次进入，不更新对话，只更新状态文本
    if (!petState.isFirstEntry) {
      // 计算当前应该显示的对话文本
      let currentNormalDialogue = '';

      if (petState.isSleeping) {
        currentNormalDialogue = NORMAL_DIALOGUES.sleeping;
      } else if (petState.happiness === GAME_CONFIG.ATTRIBUTES.CRITICAL_HAPPINESS) {
        // depressed状态优先级最高，心情值为0时始终优先触发
        currentNormalDialogue = _.sample(Array.isArray(NORMAL_DIALOGUES.depressed) ? NORMAL_DIALOGUES.depressed : [NORMAL_DIALOGUES.depressed])!;
      } else if (petState.energy < GAME_CONFIG.ATTRIBUTES.LOW_ENERGY_THRESHOLD) {
        currentNormalDialogue = NORMAL_DIALOGUES.tired;
      } else if (petState.happiness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
        currentNormalDialogue = _.sample(Array.isArray(NORMAL_DIALOGUES.bored) ? NORMAL_DIALOGUES.bored : [NORMAL_DIALOGUES.bored])!;
      } else if (petState.cleanliness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
        currentNormalDialogue = _.sample(Array.isArray(NORMAL_DIALOGUES.dirty) ? NORMAL_DIALOGUES.dirty : [NORMAL_DIALOGUES.dirty])!;
      } else if (petState.fullness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
        currentNormalDialogue = _.sample(Array.isArray(NORMAL_DIALOGUES.hungry) ? NORMAL_DIALOGUES.hungry : [NORMAL_DIALOGUES.hungry])!;
      } else {
        const normalTexts = NORMAL_DIALOGUES.normal;
        currentNormalDialogue = Array.isArray(normalTexts) ? _.sample(normalTexts)! : normalTexts;
      }

      // 计算当前应该显示的状态文本
      const currentStatusText = calculateCurrentStatusText();

      // 检查是否需要更新内容（对话和状态文本同步）
      const shouldUpdateDialogue = petState.dialogue !== currentNormalDialogue;
      const shouldUpdateStatus = petState.currentStatusText !== currentStatusText;
      const shouldUpdate = shouldUpdateDialogue || shouldUpdateStatus;

      if (shouldUpdate || forceUpdate) {
        // 如果是强制更新，或者距离上次内容更新已经超过10秒
        const timeSinceLastContentUpdate = petState.lastContentUpdateTime
          ? (now - petState.lastContentUpdateTime) / 1000
          : Infinity;

        if (forceUpdate || timeSinceLastContentUpdate >= GAME_CONFIG.TIMING.CONTENT_UPDATE_INTERVAL) {
          // 同时更新对话和状态文本，确保同步切换
          petState.dialogue = currentNormalDialogue;
          petState.currentStatusText = currentStatusText;
          petState.lastContentUpdateTime = now;
        }
      }
    } else {
      // 首次进入时，只更新状态文本，保持开场白不变
      const currentStatusText = calculateCurrentStatusText();
      petState.currentStatusText = currentStatusText;
      petState.lastContentUpdateTime = now;
    }
  }
}


// 导出的 Composable 函数
export function usePetState() {

  // 计算属性：通用状态文本
  const statusText = computed(() => {
    // 如果正在显示临时状态文本，返回临时状态文本
    if (petState.isTempDisplay && petState.tempStatusText) {
      return petState.tempStatusText;
    }

    // 如果有缓存的状态文本，返回缓存的文本
    if (petState.currentStatusText) {
      return petState.currentStatusText;
    }

    // 否则计算并返回当前状态文本
    return calculateCurrentStatusText();
  });

  // 计算属性：当前对话文本
  const currentDialogue = computed(() => {
    // 如果正在显示临时对话文本，返回临时对话文本
    if (petState.isTempDisplay && petState.tempDialogue) {
      return petState.tempDialogue;
    }
    return petState.dialogue;
  });

  // 计算属性：通常对话文本
  const normalDialogue = computed(() => {
    if (petState.isSleeping) return NORMAL_DIALOGUES.sleeping;

    // 抑郁状态优先级最高，心情值为0时始终优先触发
    if (petState.happiness === GAME_CONFIG.ATTRIBUTES.CRITICAL_HAPPINESS) {
      return _.sample(Array.isArray(NORMAL_DIALOGUES.depressed) ? NORMAL_DIALOGUES.depressed : [NORMAL_DIALOGUES.depressed])!;
    }

    // 收集其他负面状态（排除抑郁状态）
    const negativeStates = [];
    if (petState.fullness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) negativeStates.push('hungry');
    if (petState.happiness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD && petState.happiness !== 0) negativeStates.push('bored');
    if (petState.energy < GAME_CONFIG.ATTRIBUTES.LOW_ENERGY_THRESHOLD) negativeStates.push('tired');
    if (petState.cleanliness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) negativeStates.push('dirty');

    // 如果有多个负面状态，随机选择一个显示
    if (negativeStates.length > 1) {
      const randomState = _.sample(negativeStates)!;
      switch (randomState) {
        case 'hungry':
          return _.sample(Array.isArray(NORMAL_DIALOGUES.hungry) ? NORMAL_DIALOGUES.hungry : [NORMAL_DIALOGUES.hungry])!;
        case 'bored':
          return _.sample(Array.isArray(NORMAL_DIALOGUES.bored) ? NORMAL_DIALOGUES.bored : [NORMAL_DIALOGUES.bored])!;
        case 'tired':
          return NORMAL_DIALOGUES.tired;
        case 'dirty':
          return _.sample(Array.isArray(NORMAL_DIALOGUES.dirty) ? NORMAL_DIALOGUES.dirty : [NORMAL_DIALOGUES.dirty])!;
      }
    }

    // 如果只有一个或没有负面状态，按原有逻辑处理
    if (petState.fullness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
      return _.sample(Array.isArray(NORMAL_DIALOGUES.hungry) ? NORMAL_DIALOGUES.hungry : [NORMAL_DIALOGUES.hungry])!;
    }
    if (petState.happiness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
      return _.sample(Array.isArray(NORMAL_DIALOGUES.bored) ? NORMAL_DIALOGUES.bored : [NORMAL_DIALOGUES.bored])!;
    }
    if (petState.energy < GAME_CONFIG.ATTRIBUTES.LOW_ENERGY_THRESHOLD) return NORMAL_DIALOGUES.tired;
    if (petState.cleanliness < GAME_CONFIG.ATTRIBUTES.LOW_ATTRIBUTE_THRESHOLD) {
      return _.sample(Array.isArray(NORMAL_DIALOGUES.dirty) ? NORMAL_DIALOGUES.dirty : [NORMAL_DIALOGUES.dirty])!;
    }

    // normal 现在是数组，需要随机选择一个
    const normalTexts = NORMAL_DIALOGUES.normal;
    return Array.isArray(normalTexts) ? _.sample(normalTexts)! : normalTexts;
  });


  // 检查并清除过期的临时显示（只用于没有自动清除延迟的情况）
  function checkTempDisplay() {
    if (petState.isTempDisplay && petState.tempDisplayStartTime) {
      const elapsed = Date.now() - petState.tempDisplayStartTime;
      if (elapsed > GAME_CONFIG.TIMING.TEMP_DISPLAY_DURATION) {
        clearTempDisplay();
      }
    }
  }

  // 核心交互函数
  function handleInteraction(cost: number = GAME_CONFIG.ATTRIBUTES.INTERACTION_COST) {
    // 如果是首次进入，立即结束首次进入状态
    if (petState.isFirstEntry) {
      petState.isFirstEntry = false;
      // 切换到正常对话
      const normalDialogue = computeNormalDialogue();
      petState.dialogue = normalDialogue;
      petState.currentStatusText = calculateCurrentStatusText();
      petState.lastContentUpdateTime = Date.now();
    }

    // 检查体力是否不足以进行互动
    if (petState.energy < cost) {
      // 使用临时显示显示疲劳对话，计算打字机时间+停顿时间
      const typingTime = TIRED_DIALOGUE.length * GAME_CONFIG.TIMING.TYPEWRITER_SPEED;
      const pauseTime = GAME_CONFIG.TIMING.AUTO_CLEAR_DELAY;
      const totalTime = typingTime + pauseTime;
      setTempDisplay(STATUS_TEXTS.tired, TIRED_DIALOGUE, totalTime);
      return false;
    }

    petState.energy = Math.max(GAME_CONFIG.ATTRIBUTES.MIN_ATTRIBUTE_VALUE, petState.energy - cost);
    petState.lastInteractionTime = Date.now();
    petState.inactivityCycles = 0;
    return true;
  }

  function feed(item: '基础饲料' | '热汤面' | '一坨糊糊') {
    if (!handleInteraction()) return;

    if (item === '一坨糊糊') {
      // 特殊效果：心情值降低3~5点，饱腹值与清洁度不变，体力值减5
      petState.happiness = Math.max(
        GAME_CONFIG.ATTRIBUTES.MIN_ATTRIBUTE_VALUE,
        petState.happiness - _.random(GAME_CONFIG.INTERACTION.BAD_FOOD_HAPPINESS_MIN, GAME_CONFIG.INTERACTION.BAD_FOOD_HAPPINESS_MAX)
      );
    } else {
      // 正常喂食效果
      petState.fullness = Math.min(
        GAME_CONFIG.ATTRIBUTES.MAX_ATTRIBUTE_VALUE,
        petState.fullness + (item === '热汤面' ? GAME_CONFIG.INTERACTION.FEED_NOODLE : GAME_CONFIG.INTERACTION.FEED_BASIC)
      );
      petState.happiness = Math.min(
        GAME_CONFIG.ATTRIBUTES.MAX_ATTRIBUTE_VALUE,
        petState.happiness + _.random(GAME_CONFIG.INTERACTION.HAPPINESS_GAIN_MIN, GAME_CONFIG.INTERACTION.HAPPINESS_GAIN_MAX)
      );
      petState.cleanliness = Math.max(
        GAME_CONFIG.ATTRIBUTES.MIN_ATTRIBUTE_VALUE,
        petState.cleanliness - _.random(GAME_CONFIG.INTERACTION.CLEAN_DIRTY_MIN, GAME_CONFIG.INTERACTION.CLEAN_DIRTY_MAX)
      );
    }

    // 设置临时状态和对话，计算打字机时间+停顿时间
    const statusText = Array.isArray(TEMP_STATUS_TEXTS.feed[item])
      ? _.sample(TEMP_STATUS_TEXTS.feed[item])!
      : TEMP_STATUS_TEXTS.feed[item];
    const dialogue = _.sample(DIALOGUES.feed[item])!;
    const typingTime = dialogue.length * GAME_CONFIG.TIMING.TYPEWRITER_SPEED;
    const pauseTime = GAME_CONFIG.TIMING.AUTO_CLEAR_DELAY;
    const totalTime = typingTime + pauseTime;
    setTempDisplay(statusText, dialogue, totalTime);
  }

  function clean(item: '打扫' | '洗澡' | '梳毛') {
    if (!handleInteraction()) return;
    petState.cleanliness = Math.min(
      GAME_CONFIG.ATTRIBUTES.MAX_ATTRIBUTE_VALUE,
      petState.cleanliness + (item === '洗澡' ? GAME_CONFIG.INTERACTION.CLEAN_BATH : (item === '梳毛' ? GAME_CONFIG.INTERACTION.CLEAN_BRUSH : GAME_CONFIG.INTERACTION.CLEAN_BASIC))
    );
    petState.happiness = Math.min(
      GAME_CONFIG.ATTRIBUTES.MAX_ATTRIBUTE_VALUE,
      petState.happiness + _.random(GAME_CONFIG.INTERACTION.HAPPINESS_GAIN_MIN, GAME_CONFIG.INTERACTION.HAPPINESS_GAIN_MAX)
    );

    // 设置临时状态和对话，计算打字机时间+停顿时间
    const statusText = Array.isArray(TEMP_STATUS_TEXTS.clean[item])
      ? _.sample(TEMP_STATUS_TEXTS.clean[item])!
      : TEMP_STATUS_TEXTS.clean[item];
    const dialogue = _.sample(DIALOGUES.clean[item])!;
    const typingTime = dialogue.length * GAME_CONFIG.TIMING.TYPEWRITER_SPEED;
    const pauseTime = GAME_CONFIG.TIMING.AUTO_CLEAR_DELAY;
    const totalTime = typingTime + pauseTime;
    setTempDisplay(statusText, dialogue, totalTime);
  }

  function play(item: '小吉他' | '玩游戏' | '翻花绳') {
    if (!handleInteraction()) return;
    petState.happiness = Math.min(
      GAME_CONFIG.ATTRIBUTES.MAX_ATTRIBUTE_VALUE,
      petState.happiness + _.random(GAME_CONFIG.INTERACTION.PLAY_HAPPINESS_MIN, GAME_CONFIG.INTERACTION.PLAY_HAPPINESS_MAX)
    );
    petState.cleanliness = Math.max(
      GAME_CONFIG.ATTRIBUTES.MIN_ATTRIBUTE_VALUE,
      petState.cleanliness - _.random(GAME_CONFIG.INTERACTION.CLEAN_DIRTY_MIN, GAME_CONFIG.INTERACTION.CLEAN_DIRTY_MAX)
    );

    // 设置临时状态和对话，计算打字机时间+停顿时间
    const statusText = Array.isArray(TEMP_STATUS_TEXTS.play[item])
      ? _.sample(TEMP_STATUS_TEXTS.play[item])!
      : TEMP_STATUS_TEXTS.play[item];
    const dialogue = _.sample(DIALOGUES.play[item])!;
    const typingTime = dialogue.length * GAME_CONFIG.TIMING.TYPEWRITER_SPEED;
    const pauseTime = GAME_CONFIG.TIMING.AUTO_CLEAR_DELAY;
    const totalTime = typingTime + pauseTime;
    setTempDisplay(statusText, dialogue, totalTime);
  }

  function sleep() {
    // 立即清除任何当前的临时显示
    if (petState.isTempDisplay) {
      clearTempDisplay();
    }

    // 检查 notSleepy 条件：体力充足且不在睡觉状态
    if (petState.energy >= GAME_CONFIG.ATTRIBUTES.SLEEP_THRESHOLD && !petState.isSleeping) {
      // 使用临时显示显示不想睡的对话和状态文本，计算打字机时间+停顿时间
      const typingTime = NOT_SLEEPY_DIALOGUE.length * GAME_CONFIG.TIMING.TYPEWRITER_SPEED;
      const pauseTime = GAME_CONFIG.TIMING.AUTO_CLEAR_DELAY;
      const totalTime = typingTime + pauseTime;
      setTempDisplay(STATUS_TEXTS.notSleepy, NOT_SLEEPY_DIALOGUE, totalTime);
      // 更新互动时间但不消耗体力
      petState.lastInteractionTime = Date.now();
      petState.inactivityCycles = 0;
      return false;
    }

    // 设置睡眠状态，使用临时状态文本和对话显示睡觉动作，计算打字机时间+停顿时间
    petState.isSleeping = true;
    const sleepStatusText = TEMP_STATUS_TEXTS.sleep;
    const sleepDialogue = _.sample(SLEEP_DIALOGUES)!;
    const typingTime = sleepDialogue.length * GAME_CONFIG.TIMING.TYPEWRITER_SPEED;
    const pauseTime = GAME_CONFIG.TIMING.AUTO_CLEAR_DELAY;
    const totalTime = typingTime + pauseTime;
    setTempDisplay(sleepStatusText, sleepDialogue, totalTime);
    return true;
  }

  function wakeUp() {
    petState.isSleeping = false;
    // 使用临时显示显示醒来的对话和状态文本，计算打字机时间+停顿时间
    const wakeStatusText = TEMP_STATUS_TEXTS.wakeUp;
    const wakeDialogue = _.sample(WAKE_DIALOGUE)!;
    const typingTime = wakeDialogue.length * GAME_CONFIG.TIMING.TYPEWRITER_SPEED;
    const pauseTime = GAME_CONFIG.TIMING.AUTO_CLEAR_DELAY;
    const totalTime = typingTime + pauseTime;
    setTempDisplay(wakeStatusText, wakeDialogue, totalTime);
    petState.lastInteractionTime = Date.now();
    petState.inactivityCycles = 0;
  }

  // 处理首次进入逻辑
  function handleFirstEntry() {
    if (petState.isFirstEntry) {
      // 设置首次进入延迟后自动切换到正常对话
      setTimeout(() => {
        // 只有仍然是首次进入状态时才执行切换
        if (petState.isFirstEntry) {
          petState.isFirstEntry = false;
          // 切换到正常对话
          const normalDialogue = computeNormalDialogue();
          petState.dialogue = normalDialogue;
          petState.currentStatusText = calculateCurrentStatusText();
          petState.lastContentUpdateTime = Date.now();
        }
      }, GAME_CONFIG.TIMING.FIRST_ENTRY_DELAY);
    }
  }

  // 立即更新状态（用于预加载）
  function updateImmediately() {
    // 强制更新状态，忽略时间限制
    updateState(true);

    // 如果是首次进入，不覆盖开场白，而是启动首次进入逻辑
    if (petState.isFirstEntry) {
      // 确保状态文本是最新的，但保持开场白
      petState.currentStatusText = calculateCurrentStatusText();
      petState.lastContentUpdateTime = Date.now();
      // 启动首次进入逻辑
      handleFirstEntry();
    } else if (!petState.isTempDisplay) {
      // 非首次进入时，正常更新对话和状态文本
      petState.currentStatusText = calculateCurrentStatusText();
      petState.dialogue = computeNormalDialogue();
      petState.lastContentUpdateTime = Date.now();
    }
  }

  return {
    petState,
    statusText,
    currentDialogue,
    normalDialogue,
    feed,
    clean,
    play,
    sleep,
    wakeUp,
    setTempDisplay,
    clearTempDisplay,
    checkTempDisplay,
    updateImmediately,
  };
}
