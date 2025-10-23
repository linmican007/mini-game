// 加载逻辑模块
import { EXPRESSIONS } from './constants';

// 需要预加载的图片资源
const IMAGE_URLS = [
  // 标题图片
  'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAEDrUZo-Y8rK7CuT3MRrhzKBc-whRKtaAACtxcAAoqN0FduqntTYLwOuDYE.png',
  // 猜拳游戏表情图片
  ...Object.values(EXPRESSIONS).flat()
];

// 加载状态接口
export interface LoadingState {
  totalResources: number;
  loadedResources: number;
  progress: number;
  isLoading: boolean;
  error: string | null;
}

// 加载管理器类
export class LoaderManager {
  private state: LoadingState = {
    totalResources: 0,
    loadedResources: 0,
    progress: 0,
    isLoading: false,
    error: null
  };

  private progressCallbacks: ((progress: number) => void)[] = [];
  private completeCallbacks: (() => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private statusCallbacks: ((status: string) => void)[] = [];
  private clearStatusCallbacks: (() => void)[] = [];

  constructor() {
    this.state.totalResources = IMAGE_URLS.length + 1; // 图片 + 拓麻歌子状态初始化
  }

  // 获取当前状态
  getState(): LoadingState {
    return { ...this.state };
  }

  // 注册进度回调
  onProgress(callback: (progress: number) => void) {
    this.progressCallbacks.push(callback);
  }

  // 注册完成回调
  onComplete(callback: () => void) {
    this.completeCallbacks.push(callback);
  }

  // 注册错误回调
  onError(callback: (error: string) => void) {
    this.errorCallbacks.push(callback);
  }

  // 注册状态回调
  onStatus(callback: (status: string) => void) {
    this.statusCallbacks.push(callback);
  }

  // 注册清除状态回调
  onClearStatus(callback: () => void) {
    this.clearStatusCallbacks.push(callback);
  }

  // 更新进度
  private updateProgress() {
    this.state.progress = Math.round((this.state.loadedResources / this.state.totalResources) * 100);

    // 通知所有进度回调
    this.progressCallbacks.forEach(callback => callback(this.state.progress));

    // 检查是否完成
    if (this.state.loadedResources >= this.state.totalResources) {
      this.complete();
    }
  }

  // 标记资源加载完成
  private markResourceLoaded() {
    this.state.loadedResources++;
    this.updateProgress();
  }

  // 加载完成
  private complete() {
    this.state.isLoading = false;
    this.completeCallbacks.forEach(callback => callback());
  }

  // 处理错误
  private handleError(error: string) {
    this.state.error = error;
    this.state.isLoading = false;
    this.errorCallbacks.forEach(callback => callback(error));
  }

  // 通知状态更新
  private notifyStatus(status: string) {
    this.statusCallbacks.forEach(callback => callback(status));
  }

  // 清除状态
  private clearStatus() {
    this.clearStatusCallbacks.forEach(callback => callback());
  }

  // 预加载图片
  private preloadImages(): Promise<void> {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalImages = IMAGE_URLS.length;

      if (totalImages === 0) {
        resolve();
        return;
      }

      IMAGE_URLS.forEach(url => {
        const img = new Image();
        img.src = url;

        img.onload = () => {
          loadedCount++;
          this.markResourceLoaded();

          if (loadedCount === totalImages) {
            resolve();
          }
        };

        img.onerror = () => {
          // 即使加载失败也继续，避免卡住
          loadedCount++;
          this.markResourceLoaded();

          if (loadedCount === totalImages) {
            resolve();
          }
        };
      });
    });
  }

  // 初始化拓麻歌子状态
  private async initializeTamagotchiState(): Promise<void> {
    try {
      // 通知开始初始化拓麻歌子状态
      this.notifyStatus('正在初始化拓麻歌子状态...');

      // 动态导入拓麻歌子模块以触发全局状态初始化
      const tamagotchiModule = await import('./tamagotchi');

      // 确保全局状态已初始化
      if (tamagotchiModule.usePetState) {
        // 调用 usePetState 来确保状态初始化
        const petStateController = tamagotchiModule.usePetState();

        // 通知开始预热状态
        this.notifyStatus('正在预热宠物状态...');

        // 立即更新状态到最新，确保玩家看到的是当前时间点的准确状态
        if (petStateController && typeof petStateController.updateImmediately === 'function') {
          await petStateController.updateImmediately();
        }

        // 通知状态预热完成
        this.notifyStatus('宠物状态预热完成！');

        // 短暂显示完成信息后清除
        setTimeout(() => {
          this.clearStatus();
        }, 1000);
      }

      this.markResourceLoaded();
    } catch (error) {
      console.warn('拓麻歌子状态初始化失败:', error);
      this.notifyStatus('状态初始化失败，继续加载...');
      // 即使初始化失败也继续，避免卡住
      this.markResourceLoaded();
    }
  }

  // 开始加载
  async startLoading(): Promise<void> {
    if (this.state.isLoading) {
      return;
    }

    this.state.isLoading = true;
    this.state.error = null;
    this.state.loadedResources = 0;
    this.state.progress = 0;

    try {
      // 并行执行图片预加载和状态初始化
      await Promise.all([
        this.preloadImages(),
        this.initializeTamagotchiState()
      ]);
    } catch (error) {
      this.handleError(`加载失败: ${error}`);
    }
  }

  // 重置状态
  reset() {
    this.state = {
      totalResources: IMAGE_URLS.length + 1,
      loadedResources: 0,
      progress: 0,
      isLoading: false,
      error: null
    };

    this.progressCallbacks = [];
    this.completeCallbacks = [];
    this.errorCallbacks = [];
    this.statusCallbacks = [];
    this.clearStatusCallbacks = [];
  }
}

// 创建全局加载管理器实例
export const loaderManager = new LoaderManager();

// 导出便捷函数
export function startLoading() {
  return loaderManager.startLoading();
}

export function onLoadingProgress(callback: (progress: number) => void) {
  loaderManager.onProgress(callback);
}

export function onLoadingComplete(callback: () => void) {
  loaderManager.onComplete(callback);
}

export function onLoadingError(callback: (error: string) => void) {
  loaderManager.onError(callback);
}

export function onLoadingStatus(callback: (status: string) => void) {
  loaderManager.onStatus(callback);
}

export function onLoadingClearStatus(callback: () => void) {
  loaderManager.onClearStatus(callback);
}

export function getLoadingState() {
  return loaderManager.getState();
}
