//COPYRIGHT 2023 IndicioPBC
export interface InternalStorage {
  setItem(key: string, item: string): Promise<void>
  getItem(key: string): Promise<string | null>
  deleteItem(key: string): Promise<void>
  init(): Promise<void>
}
