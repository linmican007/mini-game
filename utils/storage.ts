/**
 * 安全存储工具类
 * 提供带有错误处理的localStorage操作
 */
export class SafeStorage {
  /**
   * 安全地从localStorage获取数据
   * @param key 存储键
   * @param defaultValue 默认值
   * @returns 解析后的数据或默认值
   */
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Storage read failed for key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * 安全地向localStorage存储数据
   * @param key 存储键
   * @param value 要存储的值
   * @returns 是否存储成功
   */
  static setItem(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Storage write failed for key ${key}:`, error);
      return false;
    }
  }

  /**
   * 安全地从localStorage删除数据
   * @param key 存储键
   * @returns 是否删除成功
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Storage remove failed for key ${key}:`, error);
      return false;
    }
  }

  /**
   * 检查localStorage中是否存在指定键
   * @param key 存储键
   * @returns 是否存在
   */
  static hasItem(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.warn(`Storage check failed for key ${key}:`, error);
      return false;
    }
  }

  /**
   * 清空localStorage
   * @returns 是否清空成功
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Storage clear failed:', error);
      return false;
    }
  }

  /**
   * 获取localStorage中所有键
   * @returns 键数组
   */
  static getAllKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.warn('Storage get all keys failed:', error);
      return [];
    }
  }

  /**
   * 获取存储空间使用情况
   * @returns 存储信息对象
   */
  static getStorageInfo(): { used: number; available: number; total: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // 大多数浏览器的localStorage限制为5MB
      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;

      return { used, available, total };
    } catch (error) {
      console.warn('Storage info calculation failed:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }
}
