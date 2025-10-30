<template>
  <div class="end-card">
    <img :src="result.face" class="end-ai-image" alt="方亦楷表情" />
    <p class="end-comment">{{ result.dialogue }}</p>
    <h2 class="end-title">🏁 比赛结束！</h2>
    <div class="end-scoreboard">
      <div class="end-score">你：<span>{{ playerScore }}</span></div>
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
import { END_GAME_DIALOGUES, END_GAME_SUMMARY, EXPRESSIONS, SPECIAL_END_DIALOGUES, SPECIAL_END_SUMMARY } from '../games/constants';
import _ from 'lodash';

const props = defineProps<{ playerScore: number; aiScore: number }>();
defineEmits(['restart', 'back-to-menu']);

const result = computed(() => {
  // 检查特殊比分情况
  const scoreKey = `${props.playerScore}-${props.aiScore}`;
  const isSpecialScore = scoreKey === '3-0' || scoreKey === '0-3' || scoreKey === '0-0';

  if (isSpecialScore) {
    // 使用特殊比分台词
    const dialogue = _.sample(SPECIAL_END_DIALOGUES[scoreKey as keyof typeof SPECIAL_END_DIALOGUES])!;
    const summary = SPECIAL_END_SUMMARY[scoreKey as keyof typeof SPECIAL_END_SUMMARY];
    const face = _.sample(EXPRESSIONS[scoreKey === '3-0' ? 'negative' : scoreKey === '0-3' ? 'positive' : 'neutral'])!;
    return { dialogue, summary, face };
  }

  // 使用通用台词
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
