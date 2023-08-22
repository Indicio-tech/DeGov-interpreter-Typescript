import type ReactStorage from "@react-native-async-storage/async-storage"

export interface InternalStorage {
  setItem(key: string, item: string): Promise<void>
  getItem(key: string): Promise<string | null>
  deleteItem(key: string): Promise<void>
}

export class WebStorage implements InternalStorage {
  setItem(key: string, item: string): Promise<void> {
    try {
      localStorage.setItem(key, item)
      return new Promise(() => {})
    } catch (e: any) {
      console.log("Failed to set item with Error: ", e.message)
      return new Promise((resolve, reject) => {
        reject("Internal Error")
      })
    }
  }
  getItem(key: string): Promise<string | null> {
    try {
      const item = localStorage.getItem(key)
      return new Promise((resolve) => {
        resolve(item)
      })
    } catch (e: any) {
      console.log("Failed to get item with Error: ", e.message)
      return new Promise((resolve) => {
        resolve(null)
      })
    }
  }
  deleteItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
      return new Promise(() => {})
    } catch (e: any) {
      console.log("Failed to delete item with Error: ", e.message)
      return new Promise((resolve, reject) => {
        reject("Internal Error")
      })
    }
  }
}

export class ReactNativeStorage implements InternalStorage {
  private storage: typeof ReactStorage

  constructor(storage: typeof ReactStorage) {
    this.storage = storage
  }

  setItem(key: string, item: string): Promise<void> {
    return this.storage.setItem(key, item)
  }
  getItem(key: string): Promise<string | null> {
    return this.storage.getItem(key)
  }
  deleteItem(key: string): Promise<void> {
    return this.storage.removeItem(key)
  }
}
