/**
 * 游戏配置常量
 * 统一管理所有游戏相关的配置参数
 */
export const GAME_CONFIG = {
  // 时间相关配置
  TIMING: {
    STATE_UPDATE_INTERVAL: 10000,        // 状态更新间隔：10秒
    TEMP_DISPLAY_CHECK: 1000,           // 临时显示检查间隔：1秒
    TYPEWRITER_SPEED: 50,               // 打字机效果速度：50ms/字符
    ROUND_DELAY: 2500,                  // 回合延迟：2.5秒
    COUNTDOWN_DURATION: 10000,          // 倒计时持续时间：10秒
    COUNTDOWN_INTERVAL: 1000,           // 倒计时间隔：1秒
    FIRST_ENTRY_DELAY: 3000,             // 首次进入延迟：3秒
    TEMP_DISPLAY_DURATION: 8000,         // 临时显示持续时间：8秒
    AUTO_CLEAR_DELAY: 3000,              // 自动清除延迟：3秒
    CONTENT_UPDATE_INTERVAL: 10,           // 内容更新间隔：10秒
    SLEEP_BUTTON_RESET: 2000,            // 睡眠按钮重置延迟：2秒
  },

  // 属性相关配置
  ATTRIBUTES: {
    INTERACTION_COST: 5,                 // 互动消耗体力：5点
    SLEEP_THRESHOLD: 50,                // 睡眠体力阈值：50点
    CRITICAL_HAPPINESS: 0,              // 临界心情值：0点
    LOW_ENERGY_THRESHOLD: 20,           // 低体力阈值：20点
    LOW_ATTRIBUTE_THRESHOLD: 50,        // 低属性阈值：50点
    MAX_ATTRIBUTE_VALUE: 100,            // 属性最大值：100点
    MIN_ATTRIBUTE_VALUE: 0,              // 属性最小值：0点
  },

  // 状态衰减配置
  DECAY: {
    FULLNESS_RATE: 60,                  // 饱腹度衰减：每60秒-1点
    CLEANLINESS_RATE: 120,              // 清洁度衰减：每120秒-1点
    ENERGY_RECOVERY_RATE: 60,           // 体力恢复：每60秒+1点
    SLEEP_ENERGY_RATE: 10,              // 睡眠体力恢复：每10秒+1点
    INACTIVITY_CYCLE: 900,              // 无互动周期：900秒（15分钟）
    HAPPINESS_DROP_EARLY: 10,           // 早期心情衰减：前4次每次10点
    HAPPINESS_DROP_LATE: 15,             // 后期心情衰减：第5次起每次15点
    HAPPINESS_DROP_THRESHOLD: 4,        // 早期衰减阈值：前4次
  },

  // 互动效果配置
  INTERACTION: {
    FEED_BASIC: 15,                     // 基础饲料饱腹度+15
    FEED_NOODLE: 20,                    // 热汤面饱腹度+20
    HAPPINESS_GAIN_MIN: 1,              // 心情最小增益：1点
    HAPPINESS_GAIN_MAX: 5,              // 心情最大增益：5点
    PLAY_HAPPINESS_MIN: 5,              // 玩耍心情最小增益：5点
    PLAY_HAPPINESS_MAX: 10,             // 玩耍心情最大增益：10点
    CLEAN_DIRTY_MIN: 1,                 // 清洁脏污最小值：1点
    CLEAN_DIRTY_MAX: 3,                 // 清洁脏污最大值：3点
    CLEAN_BASIC: 15,                    // 基础清洁+15
    CLEAN_BRUSH: 10,                    // 梳毛清洁+10
    CLEAN_BATH: 25,                     // 洗澡清洁+25
    BAD_FOOD_HAPPINESS_MIN: 3,          // 坏食物心情最小损失：3点
    BAD_FOOD_HAPPINESS_MAX: 5,          // 坏食物心情最大损失：5点
  },

  // 存储相关配置
  STORAGE: {
    PET_STATE_KEY: 'tamagotchi_pet_state_v2',
  },

  // 游戏规则配置
  GAME_RULES: {
    RPS_ROUNDS_TO_WIN: 3,               // 猜拳获胜所需回合数：3回合
    RPS_MAX_ROUNDS: 5,                   // 猜拳最大回合数：5回合
  },
} as const;

// 导出类型定义
export type GameConfig = typeof GAME_CONFIG;
export type TimingConfig = typeof GAME_CONFIG.TIMING;
export type AttributesConfig = typeof GAME_CONFIG.ATTRIBUTES;
export type DecayConfig = typeof GAME_CONFIG.DECAY;
export type InteractionConfig = typeof GAME_CONFIG.INTERACTION;
export type StorageConfig = typeof GAME_CONFIG.STORAGE;
export type GameRulesConfig = typeof GAME_CONFIG.GAME_RULES;
