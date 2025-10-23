<template>
  <div class="end-card">
    <img :src="result.face" class="end-ai-image" alt="方亦楷表情" />
    <p class="end-comment">{{ result.dialogue }}</p>
    <h2 class="end-title">🏁 比赛结束！</h2>
    <div class="end-scoreboard">
      <div class="end-score">玩家：<span>{{ playerScore }}</span></div>
      <div class="end-score">方亦楷：<span>{{ aiScore }}</span></div>
    </div>
    <p class="end-summary">{{ result.summary }}</p>
    <div class="end-actions">
      <button class="btn" @click="$emit('restart')">再战一局</button>
      <button class="btn ghost" @click="$emit('back-to-menu')">返回首页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { END_GAME_DIALOGUES, END_GAME_SUMMARY, EXPRESSIONS } from '../games/constants';
import _ from 'lodash';

const props = defineProps<{ playerScore: number; aiScore: number }>();
defineEmits(['restart', 'back-to-menu']);

const result = computed(() => {
  let outcome: 'win' | 'lose' | 'draw';
  if (props.playerScore > props.aiScore) {
    outcome = 'win';
  } else if (props.aiScore > props.playerScore) {
    outcome = 'lose';
  } else {
    outcome = 'draw';
  }

  const dialogue = _.sample(END_GAME_DIALOGUES[outcome])!;
  const summary = END_GAME_SUMMARY[outcome];
  const face = _.sample(EXPRESSIONS[outcome === 'win' ? 'negative' : outcome === 'lose' ? 'positive' : 'neutral'])!;

  return { dialogue, summary, face };
});
</script>

<style scoped>
.end-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  margin-top: 5rem; /* Space for the avatar to pop out */
}

.end-ai-image {
  width: 8.125rem;
  height: 8.125rem;
  border-radius: 50%;
  border: 4px solid var(--border-medium);
  box-shadow: 0 var(--spacing-s) var(--spacing-m) rgba(249, 214, 182, 0.9);
  background-color: #fffdf6;
  margin-top: -5rem; /* Pull the avatar up */
  z-index: 2; /* Ensure avatar is on top of comment bubble arrow */
}

.end-title {
  margin-top: var(--spacing-m);
  font-size: 1.5rem;
  color: var(--primary);
  text-shadow: 2px 2px #fff0d6;
}

.end-comment {
  position: relative;
  background: #fff8ea;
  border: 3px solid #f3cda0;
  border-radius: var(--radius-s);
  padding: var(--spacing-s) var(--spacing-m);
  max-width: 80%;
  font-size: 1.1rem;
  color: var(--text-light);
  box-shadow: var(--spacing-xs) var(--spacing-xs) 0 #f7d9b8;
  text-align: center;
  line-height: 1.4;
  margin-top: var(--spacing-m);
  z-index: 1;
}

.end-comment::before,
.end-comment::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
}

.end-comment::before {
  bottom: 100%;
  border-width: 0 0.8125rem 0.8125rem 0.8125rem;
  border-color: transparent transparent #f3cda0 transparent;
}

.end-comment::after {
  bottom: 100%;
  border-width: 0 0.625rem 0.625rem 0.625rem;
  border-color: transparent transparent #fff8ea transparent;
  margin-bottom: -3px;
}

.end-scoreboard {
  display: flex;
  gap: var(--spacing-l);
  margin-top: var(--spacing-m);
  background: var(--accent-yellow);
  border: 2px dashed var(--border-dark);
  padding: var(--spacing-s) var(--spacing-m);
  border-radius: var(--radius-s);
}

.end-score {
  font-size: 1.1rem;
  color: var(--text-dark);
}

.end-summary {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: var(--spacing-m);
}

.end-actions {
  display: flex;
  gap: var(--spacing-m);
  width: 100%;
  margin-top: var(--spacing-l);
}

.end-actions .btn {
  flex: 1;
}

.btn.ghost {
  background: transparent;
  border-style: dashed;
}
</style>
