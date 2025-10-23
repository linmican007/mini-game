<template>
  <div class="rps-game-wrapper">
    <h1 class="game-title">石头剪刀布挑战赛 </h1>

    <div class="game-status-bar">
      <div class="round-info">{{ roundInfo }}</div>
      <div class="scores">
        <div class="score player-score">玩家：<span>{{ playerScore }}</span></div>
        <div class="score ai-score">方亦楷：<span>{{ aiScore }}</span></div>
      </div>
    </div>

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

    <div class="result-display">{{ resultText }}</div>

    <div class="player-choices">
      <button class="choice-btn" @click="wrappedHandlePlayerChoice('rock')" :disabled="playerButtonsDisabled">✊</button>
      <button class="choice-btn" @click="wrappedHandlePlayerChoice('scissors')" :disabled="playerButtonsDisabled">✌️</button>
      <button class="choice-btn" @click="wrappedHandlePlayerChoice('paper')" :disabled="playerButtonsDisabled">🖐️</button>
    </div>

    <div class="countdown">{{ timeLeft }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useRockPaperScissors } from '../games/rock-paper-scissors';

export default defineComponent({
    name: 'RockPaperScissors',
    emits: ['game-over'],
    setup(_, { emit }) {
        const timeLeft = ref(10);
        let countdownTimer: number | null = null;
        const playerChoiceEmojiEl = ref<HTMLElement | null>(null);
        const aiChoiceEmojiEl = ref<HTMLElement | null>(null);

        const startCountdown = () => {
            timeLeft.value = 10;
            if (countdownTimer) clearInterval(countdownTimer);
            countdownTimer = setInterval(() => {
                timeLeft.value--;
                if (timeLeft.value <= 0) {
                    if (countdownTimer) clearInterval(countdownTimer);
                    handlePlayerChoice('timeout'); 
                }
            }, 1000);
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
                if (countdownTimer) clearInterval(countdownTimer);
                emit('game-over', { playerScore: playerScore.value, aiScore: aiScore.value });
            }
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
            if (countdownTimer) clearInterval(countdownTimer);
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

<style scoped>
.rps-game-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m); /* Use gap for consistent spacing */
}

.countdown {
  /* Remove absolute positioning */
  /* margin: 0; */ /* This will be handled in _rock_paper_scissors.scss */
}
</style>
