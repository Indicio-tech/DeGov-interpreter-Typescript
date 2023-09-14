//COPYRIGHT 2023 IndicioPBC
import type promises from "fs/promises"
import { InternalStorage } from "./InternalStorage"

export class WebStorage implements InternalStorage {
  private dictionary: { [key: string]: string } = {}
  private fs: typeof promises

  constructor(storage: typeof promises) {
    this.fs = storage
  }

  async init(): Promise<void> {
    await this.fs.access("./DegovStorage", 0).catch(async () => {
      await this.fs.mkdir("./DegovStorage")
    })
    await this.fs
      .access("./DegovStorage/WebStorage.json", 0)
      .catch(async () => {
        await this.fs.open("./DegovStorage/WebStorage.json", "w")
      })
  }

  async setItem(key: string, item: string): Promise<void> {
    try {
      this.dictionary[key] = item
      const str = JSON.stringify(this.dictionary)
      await this.fs.writeFile("./DegovStorage/WebStorage.json", str, "utf-8")
    } catch (e: any) {
      console.log("Failed to set item with Error: ", e.message)
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const file = await this.fs.readFile(
        "./DegovStorage/WebStorage.json",
        "utf-8"
      )
      if (file.length === 0) {
        throw Error("File is Empty")
      }
      this.dictionary = JSON.parse(file)
      const item = this.dictionary[key]
      return item
    } catch (e: any) {
      console.log("Failed to get item with Error: ", e.message)
      return null
    }
  }
  async deleteItem(key: string): Promise<void> {
    try {
      delete this.dictionary[key]
      await this.fs.writeFile(
        "./DegovStorage/WebStorage.json",
        JSON.stringify(this.dictionary)
      )
    } catch (e: any) {
      console.log("Failed to delete item with Error: ", e.message)
    }
  }
}
