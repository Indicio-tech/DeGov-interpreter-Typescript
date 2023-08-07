import { GovernanceFile, JsonURI } from "../types"
import type fetch from "node-fetch"
import { Fetching } from "../utils"

export interface GovernanceFiles {
  [degGovUrl: string]: {
    GovFile: GovernanceFile
    lastFetched: Date
    active: Boolean
  }
}

export class DegovService {
  private governanceFiles: GovernanceFiles = {}
  private fetch: Fetching
  public constructor(fetcher: typeof fetch) {
    this.fetch = new Fetching(fetcher)
  }
  //retreives and sets the storage to conatin all degov files in the input array
  public async setFiles(urls: [string]) {
    const files = await this.fetch.fetchAll(urls)
    files.map((file, index) => {
      const lastFetched = new Date()
      const GovFile = JSON.parse(file)
      this.governanceFiles[urls[index]] = { GovFile, lastFetched, active: true }
    })
  }
  //remove a file from the storage
  public removeFile(url: string) {
    if (this.governanceFiles[url]) {
      delete this.governanceFiles[url]
    } else {
      throw Error("File does not exist")
    }
  }
  //add a file to storage
  public async addFile(url: string) {
    const GovFile = await this.fetchFile(url)
    const lastFetched = new Date()
    this.governanceFiles[url] = { GovFile, lastFetched, active: true }
  }
  //get the file for this url and check the ttl time to determine if refetch needs to occur
  public async getFile(url: string) {
    if (this.governanceFiles[url]) {
      let GovFile: GovernanceFile = this.governanceFiles[url].GovFile
      const last = this.governanceFiles[url].lastFetched
      const ttl = GovFile.ttl
      const lastFetched: Date = new Date()
      if (lastFetched.getMinutes() - last.getMinutes() > ttl) {
        return await this.refetchFile(url)
      }
      return GovFile
    } else {
      throw Error(`File with url ${url} does not exist`)
    }
  }
  //check the did against all degov files. Refetching if the time has expired
  public async checkDid(did: string) {
    const files = this.getAllActiveFiles()
    for (let i = 0; i < files.length; i++) {
      const file = await this.getFile(files[i])
      if (await this.checkFileForDid(did, file)) return true
    }
    return false
  }

  /**
   * Whether a governace file is active given the url that it lives at
   * @param url the url string that denotes the location of the governance file
   * @returns true or false is the file is active
   */
  public isActiveFile(url: string): Boolean {
    this.getFile(url)
    const active = this.governanceFiles[url].active
    return active
  }

  /**
   * Retreives all active governance files in the interpreter
   * @returns An array of url strings for the active files in the interpreter
   */
  public getAllActiveFiles() {
    const filtered = Object.entries(this.governanceFiles).filter((file) => {
      return file[1].active
    })
    const mapped = filtered.map((file) => file[0])
    return mapped
  }

  /**
   * Retreives all inactive governance files in the interpreter
   * @returns An array of url strings for the inactive files in the interpreter
   */
  public getAllInactiveFiles() {
    return Object.entries(this.governanceFiles)
      .filter((file) => {
        return !file[1].active
      })
      .map((file) => file[0])
  }

  /**
   * This function internally sets the Governance file to active
   * @param url The url string that denotes the location of the governance file
   */
  public activateGovFile(url: string) {
    const file = this.governanceFiles[url]
    this.governanceFiles[url] = { ...file, active: true }
  }

  /**
   * This function internally sets the Governance file to inactive
   * @param url The url string that denotes the location of the governance file
   */
  public deactivateGovFile(url: string) {
    const file = this.governanceFiles[url]
    this.governanceFiles[url] = { ...file, active: false }
  }

  //fetch the file from the given url and update the storage
  private async refetchFile(url: string): Promise<GovernanceFile> {
    const GovFile = await this.fetchFile(url)
    const lastFetched = new Date()
    this.governanceFiles[url] = { GovFile, lastFetched, active: true }
    return GovFile
  }

  private async fetchFile(url: string): Promise<GovernanceFile> {
    const lastFetched = new Date()
    const response = await this.fetch.fetchUrl(url)
    const GovFile = JSON.parse(response) as GovernanceFile
    this.governanceFiles[url] = { GovFile, lastFetched, active: true }
    return GovFile
  }

  private async checkFileForDid(did: string, degov: GovernanceFile) {
    const entries = degov.participants.entries
    for (const prop in entries) {
      const entry = entries[prop as JsonURI]
      const found = entry[did]
      if (found) return true
    }
    return false
  }

  public async removeAllFiles() {
    for (const url in this.governanceFiles) {
      this.removeFile(url)
    }
  }
}
