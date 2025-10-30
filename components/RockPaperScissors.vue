<template>
  <div class="rock-paper-scissors">
    <!-- 顶部信息区：标题和状态 -->
    <div class="top-section">
      <h1 class="game-title">石头剪刀布挑战赛</h1>
      <div class="game-status-bar">
        <div class="round-info">{{ roundInfo }}</div>
        <div class="scores">
          <div class="score player-score">你：<span>{{ playerScore }}</span></div>
          <div class="score ai-score">方亦楷：<span>{{ aiScore }}</span></div>
        </div>
      </div>
    </div>

    <!-- 游戏核心区：AI和对决 -->
    <div class="game-core-section">
      <div class="ai-section">
        <img :src="aiFace" alt="方亦楷表情" class="ai-image" />
        <div class="ai-dialogue">{{ aiDialogue }}</div>
      </div>

      <div class="match-display">
        <div class="choice-display player">
          <span class="choice-label">YOU</span>
          <span class="choice-emoji" ref="playerChoiceEmojiEl">{{ playerChoiceEmoji }}</span>
        </div>
        <span class="vs-text">VS</span>
        <div class="choice-display ai">
          <span class="choice-label">KAI</span>
          <span class="choice-emoji" ref="aiChoiceEmojiEl">{{ aiChoiceEmoji }}</span>
        </div>
      </div>
    </div>

    <!-- 交互区：结果和按钮 -->
    <div class="interaction-section">
      <div class="result-display">{{ resultText }}</div>

      <div class="player-choices">
        <button class="choice-btn" @click="wrappedHandlePlayerChoice('rock')" :disabled="playerButtonsDisabled">✊</button>
        <button class="choice-btn" @click="wrappedHandlePlayerChoice('scissors')" :disabled="playerButtonsDisabled">✌️</button>
        <button class="choice-btn" @click="wrappedHandlePlayerChoice('paper')" :disabled="playerButtonsDisabled">🖐️</button>
      </div>

      <div class="countdown">{{ timeLeft }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';
import { useRockPaperScissors } from '../games/rock-paper-scissors';
import { globalTimerManager } from '../utils/timer-manager';
import { GAME_CONFIG } from '../utils/game-config';

export default defineComponent({
    name: 'RockPaperScissors',
    emits: ['game-over'],
    setup(_, { emit }) {
        const timeLeft = ref(10);
        let countdownTimer: number | null = null;
        const playerChoiceEmojiEl = ref<HTMLElement | null>(null);
        const aiChoiceEmojiEl = ref<HTMLElement | null>(null);

        const startCountdown = () => {
            timeLeft.value = GAME_CONFIG.TIMING.COUNTDOWN_DURATION / 1000;
            if (countdownTimer) globalTimerManager.clearInterval('rps-countdown');
            globalTimerManager.setInterval('rps-countdown', () => {
                timeLeft.value--;
                if (timeLeft.value <= 0) {
                    globalTimerManager.clearInterval('rps-countdown');
                    handlePlayerChoice('timeout');
                }
            }, GAME_CONFIG.TIMING.COUNTDOWN_INTERVAL);
        };

        const newStartRound = () => {
            startRound();
            startCountdown();
        };

        const {
            playerScore,
            aiScore,
            roundInfo,
            resultText,
            aiDialogue,
            aiFace,
            playerChoiceEmoji,
            aiChoiceEmoji,
            gameIsOver,
            playerButtonsDisabled,
            handlePlayerChoice,
            resetGame,
            startRound,
        } = useRockPaperScissors({ onNextRound: newStartRound });

        watch(gameIsOver, (isOver) => {
            if (isOver) {
                if (countdownTimer) globalTimerManager.clearInterval('rps-countdown');
                emit('game-over', { playerScore: playerScore.value, aiScore: aiScore.value });
            }
        });

        // 组件卸载时清理定时器
        onUnmounted(() => {
            if (countdownTimer) globalTimerManager.clearInterval('rps-countdown');
        });

        const triggerRevealAnimation = (el: HTMLElement | null) => {
            if (el) {
                el.classList.add('reveal-animation');
                el.addEventListener('animationend', () => {
                    el.classList.remove('reveal-animation');
                }, { once: true });
            }
        };

        watch(playerChoiceEmoji, () => triggerRevealAnimation(playerChoiceEmojiEl.value));
        watch(aiChoiceEmoji, () => triggerRevealAnimation(aiChoiceEmojiEl.value));

        const wrappedHandlePlayerChoice = (choice: string) => {
            if (playerButtonsDisabled.value) return;
            if (countdownTimer) globalTimerManager.clearInterval('rps-countdown');
            handlePlayerChoice(choice);
        };

        onMounted(() => {
            resetGame();
            newStartRound();
        });

        return {
            playerScore,
            aiScore,
            roundInfo,
            resultText,
            aiDialogue,
            aiFace,
            playerChoiceEmoji,
            aiChoiceEmoji,
            playerButtonsDisabled,
            wrappedHandlePlayerChoice,
            timeLeft,
            playerChoiceEmojiEl,
            aiChoiceEmojiEl,
        };
    },
});
</script>
