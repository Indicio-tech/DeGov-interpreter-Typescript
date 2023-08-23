import type fs from "fs/promises"
import { InternalStorage } from "./InternalStorage"

export class WebStorage implements InternalStorage {
  private dictionary: { [key: string]: string } = {}
  private fs: typeof fs

  constructor(storage: typeof fs) {
    this.fs = storage
    const init = async () => {
      await this.fs
        .access("./DegovStorage", this.fs.constants.F_OK)
        .catch(async () => {
          await this.fs.mkdir("./DegovStorage")
        })
      const handle = await this.fs.open("./DegovStorage/WebStorage.json")
      await handle.close()
    }
  }

  async setItem(key: string, item: string): Promise<void> {
    try {
      this.dictionary[key] = item
      await this.fs.writeFile(
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
      const file = await this.fs.readFile("./DegovStorage/WebStorage.json")
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
      await this.fs.writeFile(
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
