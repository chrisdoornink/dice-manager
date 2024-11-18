'use client';

export interface StorageItem<T> {
  key: string;
  defaultValue: T;
}

class Storage {
  private static instance: Storage;

  private constructor() {}

  static getInstance(): Storage {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  getItem<T>(item: StorageItem<T>): T {
    if (typeof window === 'undefined') {
      return item.defaultValue;
    }

    try {
      const value = localStorage.getItem(item.key);
      return value ? JSON.parse(value) : item.defaultValue;
    } catch (error) {
      console.error(`Error reading ${item.key} from localStorage:`, error);
      return item.defaultValue;
    }
  }

  setItem<T>(item: StorageItem<T>, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(item.key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${item.key} to localStorage:`, error);
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export const storage = Storage.getInstance();
