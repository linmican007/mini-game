export const CHOICES = ['rock', 'scissors', 'paper'];

export const CHOICE_NAMES = {
  rock: '石头',
  scissors: '剪刀',
  paper: '布'
};

export const EXPRESSIONS = {
  positive: ['https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhpo89gnuiTGqlGD6ITjYvR1KihxyQACrhgAAp4roFcP8yZ35kvNgzYE.png', 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhlo89gmWz6t-QOTQhi-z3HQPil-vAACrRgAAp4roFdmUj-QWjfNOzYE.png', 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhdo89giQbuaQaanKaTj-5-msSNeAQACqxgAAp4roFd8k0JYLvo9OzYE.png', 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhxo89gn4xVcWEYQqvJNwbqpe2xl7AACsBgAAp4roFeZAzGcimqJ7DYE.png'],
  neutral: ['https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhRo89ggTwAB8L04WkHNKLgNDFhiMkkAAqgYAAKeK6BXEFJkAAElZIyvNgQ.png', 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhZo89giV30GERxb9LFKXGkWsGkO9wACqhgAAp4roFf0GGUcpJ0AAYU2BA.png'],
  negative: ['https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhto89gnPPu0vKZ-SEXjCufTcB_FCAACrxgAAp4roFcH-USwysNR8zYE.png', 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhho89gixjXkDkToPr4AAT8rb8feiqUAAqwYAAKeK6BXb3UdpnZjJ8M2BA.png', 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDhhVo89gg3SaBeCQ1CXRwPrRPb818tQACqRgAAp4roFc6jRsa-YV8vjYE.png']
};

export const DIALOGUES = {
  opening: [
    "来就来，谁怕谁。",
    "来，输的人请客吃饭。",
    "好啊，敢不敢来赌点什么？",
    "输的人今晚洗碗怎么样？",
    "事先说好，输了可别耍赖。",
    "放马过来吧，谁输谁是小狗。"
  ],
  thinking: [
    "你猜我这把会出什么？猜对了也没奖。",
    "怎么，想好了吗？要不要我多让你三秒？",
    "看你的表情，我就知道你打算出{choice}了。",
    "别紧张，放轻松，然后输给我。",
    "友情提示，石头是最没创意的出法。",
    "看我的眼神，我这把必出{choice}。信不信由你。",
    "我要出{choice}了哦。我真的要出{choice}，信我！",
    "算了，让你一局吧，我出{choice}。"
  ],
  timeout: [
    "喂，十秒到了。判我赢啊。",
    "时间到——想什么呢那么入神？想着怎么输给我？",
    "选择困难症犯了？那我就不客气了。",
    "叮咚——时间到。承让。",
    "超时了。我赢了啊，笨。",
    "反应这么慢，不会是睡着了吧？",
    "赢了，虽然胜之不武，但赢了就是赢了。哼哼。"
  ],
  result: {
    win: [
      "你的套路已经被我看穿了，下回换换？",
      "说了吧，小狗才会输。",
      "读心术罢了，不要太惊讶。",
      "就说你的小心思瞒不过我。",
      "看到了吗？这就是绝对的实力。",
      "赢了，轻轻松松。",
      "脑子转得挺快啊，就是没我快。"
    ],
    lose: [
      "操，算你运气好。",
      "行啊你，居然不按套路出牌。",
      "故意的，我这是在观察你。",
      "……嘁，下一把我绝不上当。",
      "再来！刚刚手滑了。",
      "……失误了，这把我没认真。",
      "刚才是让你的，下一局就不客气了。"
    ],
    draw: [
      "你是不是在学我？",
      "我们怎么想一块去了？",
      "……下次换个脑子再来。",
      "再来一把，我不信还能平局。",
      "怎么平了。你故意的？",
      "嗯？挺有默契啊。",
      "说不定我们心有灵犀。"
    ]
  }
};

export const ROUND_RESULT_DETAILS = {
    win: { text: "你赢了！🎉", expression: "negative" },
    lose: { text: "你输了！😈", expression: "positive" },
    draw: { text: "平局～😐", expression: "neutral" }
};

export const END_GAME_DIALOGUES = {
    win: [
      "哼，难得让你赢一回，别太得意。",
      "行，你赢了你赢了。高兴了吧？",
      "好了好了算你赢，很了不起嘛，给你拍拍手。",
      "……这局不算，今天手气有点差。",
      "愿赌服输……说吧，要我干嘛？",
      "……今天状态不好，等我调整一下再战。",
      "行吧，给你赢一次。下次可没这么好的事了。"
    ],
    lose: [
      "常胜将军的生活，就是这么朴实无华，且枯燥。",
      "哼哼哼，输的人要干嘛来着？",
      "看来我的游戏天赋确实无人能及。",
      "看吧，最终还是我赢了，心服口服了吧？",
      "怎么样，要不要拜我为师？我可以考虑考虑。",
      "下次想挑战随时奉陪，反正赢的还是我。",
      "汪汪！不对，输的人才是小狗。"
    ],
    draw: [
      "也行吧，起码没输给你。",
      "勉勉强强算是棋逢对手吧。",
      "平手啊……我们俩脑回路还挺像的。",
      "算了算了，势均力敌，算我们打了个友谊赛。",
      "那这局算谁的？再来一轮定胜负。",
      "……看来我们两个还真是难分高下。"
    ]
};

export const END_GAME_SUMMARY = {
    win: "🎉 你取得了最终胜利！",
    lose: "🐶 方亦楷赢得了胜利！",
    draw: "🤝 平局！旗鼓相当～"
};

export const SPECIAL_END_DIALOGUES = {
    '3-0': [
        "你是不是开挂了？我不信，再来一局。",
        "……不是。你今天运气怎么这么好啊？",
        "不玩了不玩了，你欺负狗，我不服。"
    ],
    '0-3': [
        "看在你输这么惨的份上，今晚这顿我请了。",
        "读心术。略懂。不收徒。"
    ],
    '0-0': [
        "……这也行？再玩下去是不是要平到天亮。",
        "我们是什么同步率百分百的笨蛋情侣吗？"
    ]
};

export const SPECIAL_END_SUMMARY = {
    '3-0': "🏆 完美胜利！你横扫了方亦楷！",
    '0-3': "🐕 完败！方亦楷小狗得志！",
    '0-0': "🌀 五局全平！你们的心电波同步了？"
};

export const EMOJI_MAP = { rock: "✊", scissors: "✌️", paper: "🖐️" };
