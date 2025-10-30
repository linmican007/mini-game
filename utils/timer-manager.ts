/**
 * 定时器管理工具类
 * 用于统一管理应用中的所有定时器，防止内存泄漏
 */
export class TimerManager {
  private timers: Map<string, number> = new Map();
  private timeouts: Map<string, number> = new Map();

  /**
   * 设置定时器
   * @param id 定时器唯一标识
   * @param callback 回调函数
   * @param delay 间隔时间（毫秒）
   */
  setInterval(id: string, callback: () => void, delay: number): void {
    this.clearInterval(id);
    const timerId = setInterval(callback, delay);
    this.timers.set(id, timerId);
  }

  /**
   * 设置延时器
   * @param id 延时器唯一标识
   * @param callback 回调函数
   * @param delay 延迟时间（毫秒）
   */
  setTimeout(id: string, callback: () => void, delay: number): void {
    this.clearTimeout(id);
    const timeoutId = setTimeout(() => {
      callback();
      this.timeouts.delete(id);
    }, delay);
    this.timeouts.set(id, timeoutId);
  }

  /**
   * 清除指定定时器
   * @param id 定时器标识
   */
  clearInterval(id: string): void {
    const timerId = this.timers.get(id);
    if (timerId) {
      clearInterval(timerId);
      this.timers.delete(id);
    }
  }

  /**
   * 清除指定延时器
   * @param id 延时器标识
   */
  clearTimeout(id: string): void {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }
  }

  /**
   * 清除所有定时器和延时器
   */
  clearAll(): void {
    this.timers.forEach(timerId => clearInterval(timerId));
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timers.clear();
    this.timeouts.clear();
  }

  /**
   * 检查定时器是否存在
   * @param id 定时器标识
   */
  hasInterval(id: string): boolean {
    return this.timers.has(id);
  }

  /**
   * 检查延时器是否存在
   * @param id 延时器标识
   */
  hasTimeout(id: string): boolean {
    return this.timeouts.has(id);
  }

  /**
   * 获取活跃定时器数量
   */
  getActiveCount(): number {
    return this.timers.size + this.timeouts.size;
  }
}

// 创建全局定时器管理器实例
export const globalTimerManager = new TimerManager();
