import type ReactStorage from "@react-native-async-storage/async-storage"
import { InternalStorage } from "./InternalStorage"

export class ReactNativeStorage implements InternalStorage {
  private storage: typeof ReactStorage

  constructor(storage: typeof ReactStorage) {
    this.storage = storage
  }
  async init() {}

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
