import type ReactStorage from "@react-native-async-storage/async-storage"
import fs from "fs/promises"

export interface InternalStorage {
  setItem(key: string, item: string): Promise<void>
  getItem(key: string): Promise<string | null>
  deleteItem(key: string): Promise<void>
}

export class WebStorage implements InternalStorage {
  private dictionary: { [key: string]: string } = {}

  constructor() {
    const init = async () => {
      await fs.access("./DegovStorage", fs.constants.F_OK).catch(async () => {
        await fs.mkdir("./DegovStorage")
      })
      const handle = await fs.open("./DegovStorage/WebStorage.json")
      await handle.close()
    }
  }

  async setItem(key: string, item: string): Promise<void> {
    try {
      this.dictionary[key] = item
      await fs.writeFile(
        "./DegovStorage/WebStorage.json",
        JSON.stringify(this.dictionary)
      )
      return new Promise((resolve) => {
        resolve()
      })
    } catch (e: any) {
      console.log("Failed to set item with Error: ", e.message)
      return new Promise((_resolve, reject) => {
        reject("Internal Error")
      })
    }
  }
  async getItem(key: string): Promise<string | null> {
    try {
      const file = await fs.readFile("./DegovStorage/WebStorage.json")
      this.dictionary = JSON.parse(file.toString())
      const item = this.dictionary[key]
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
  async deleteItem(key: string): Promise<void> {
    try {
      delete this.dictionary[key]
      await fs.writeFile(
        "./DegovStorage/WebStorage.json",
        JSON.stringify(this.dictionary)
      )
      return new Promise((resolve) => {
        resolve()
      })
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
