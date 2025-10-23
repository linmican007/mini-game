import { ref, computed } from 'vue';
import { CHOICES, CHOICE_NAMES, DIALOGUES, EXPRESSIONS, EMOJI_MAP, ROUND_RESULT_DETAILS } from './constants';

const randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function useRockPaperScissors({ onNextRound }: { onNextRound: () => void }) {
    const playerScore = ref(0);
    const aiScore = ref(0);
    const roundCount = ref(0);
    const resultText = ref('请出拳！');
    const aiDialogue = ref('「嘿嘿，准备好被我打败了吗？😏」');
    const aiFace = ref(randomFrom(EXPRESSIONS.neutral));
    const playerChoiceEmoji = ref('❓');
    const aiChoiceEmoji = ref('❓');
    const gameIsOver = ref(false);
    const playerButtonsDisabled = ref(false);

    const roundInfo = computed(() => `第 ${roundCount.value} / 5 回合`);

    const judgeRound = (playerChoice: string, aiChoice: string) => {
        if (playerChoice === aiChoice) return 'draw';
        if (
            (playerChoice === 'rock' && aiChoice === 'scissors') ||
            (playerChoice === 'scissors' && aiChoice === 'paper') ||
            (playerChoice === 'paper' && aiChoice === 'rock')
        ) {
            return 'win';
        }
        return 'lose';
    };

    const handlePlayerChoice = (choice: string) => {
        if (playerButtonsDisabled.value) return;
        playerButtonsDisabled.value = true;

        if (choice === 'timeout') {
            resultText.value = "已超时，方亦楷自动获胜！⏰";
            aiFace.value = randomFrom(EXPRESSIONS.positive);
            aiDialogue.value = randomFrom(DIALOGUES.timeout);
            aiScore.value++;
        } else {
            const aiChoice = randomFrom(CHOICES);
            const result = judgeRound(choice, aiChoice);

            playerChoiceEmoji.value = EMOJI_MAP[choice as keyof typeof EMOJI_MAP];
            aiChoiceEmoji.value = EMOJI_MAP[aiChoice as keyof typeof EMOJI_MAP];

            const details = ROUND_RESULT_DETAILS[result as keyof typeof ROUND_RESULT_DETAILS];
            resultText.value = details.text;
            aiFace.value = randomFrom(EXPRESSIONS[details.expression as keyof typeof EXPRESSIONS]);

            if (result === 'win') playerScore.value++;
            if (result === 'lose') aiScore.value++;

            const dialogueType = { win: 'lose', lose: 'win', draw: 'draw' }[result];
            aiDialogue.value = randomFrom(DIALOGUES.result[dialogueType as keyof typeof DIALOGUES.result]);
        }

        if (playerScore.value >= 3 || aiScore.value >= 3 || roundCount.value >= 5) {
            setTimeout(() => {
                gameIsOver.value = true;
            }, 2500);
        } else {
            setTimeout(onNextRound, 2500);
        }
    };

    const startRound = () => {
        roundCount.value++;
        playerChoiceEmoji.value = '❓';
        aiChoiceEmoji.value = '❓';
        resultText.value = '请出拳！';

        if (roundCount.value === 1) {
            aiDialogue.value = randomFrom(DIALOGUES.opening);
        } else {
            // 生成随机拳法并替换模板
            const randomChoice = randomFrom(CHOICES) as keyof typeof CHOICE_NAMES;
            const choiceName = CHOICE_NAMES[randomChoice];
            let dialogue = randomFrom(DIALOGUES.thinking);

            // 替换模板中的 {choice} 为随机拳法名称
            aiDialogue.value = dialogue.replace(/{choice}/g, choiceName);
        }

        aiFace.value = randomFrom(EXPRESSIONS.neutral);
        playerButtonsDisabled.value = false;
    };

    const resetGame = () => {
        playerScore.value = 0;
        aiScore.value = 0;
        roundCount.value = 0;
        gameIsOver.value = false;
    };

    return {
        playerScore,
        aiScore,
        roundCount,
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
    };
}
