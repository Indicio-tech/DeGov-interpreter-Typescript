//COPYRIGHT 2023 IndicioPBC
import { GovernanceFile, JsonURI } from "../types"
import type fetch from "node-fetch"
import { Fetching } from "../utils"
import { InternalStorage } from "../utils/InternalStorage"
import { DidDocument, getKey } from "../types/DidDoc"
import { SigAlgs } from "@hyperledger/aries-askar-shared"
import { JWTHeader } from "../types/JWT"

export interface GovernanceFiles {
  [degGovUrl: string]: {
    GovFile: GovernanceFile
    lastFetched: Date
    active: boolean
  }
}

export type DidResolver = (did: string) => Promise<DidDocument> | DidDocument

const savedKey = "GovFiles"

export class DegovService {
  private governanceFiles: GovernanceFiles = {}
  private fetch: Fetching
  private internalStorage: InternalStorage
  private resolver: DidResolver | undefined
  public constructor(
    fetcher: typeof fetch,
    storage: InternalStorage,
    didResolver: DidResolver | undefined = undefined
  ) {
    this.fetch = new Fetching(fetcher)
    this.internalStorage = storage
    this.resolver = didResolver
  }

  /**
   * Attempts to retrieve files from storage and resume previous state
   */
  public async init() {
    try {
      require("@hyperledger/aries-askar-nodejs")
    } catch {
      try {
        require("@hyperledger/aries-askar-react-native")
      } catch {
        throw new Error("Could not load Aries Askar Bindings")
      }
    }
    await this.internalStorage.init()
    const retrieved = await this.internalStorage.getItem(savedKey)
    if (retrieved) {
      this.governanceFiles = JSON.parse(retrieved)
      Object.entries(this.governanceFiles).forEach((curr, index) => {
        this.governanceFiles[curr[0]] = {
          ...this.governanceFiles[curr[0]],
          lastFetched: new Date(curr[1].lastFetched),
        }
      })
    }
  }

  public getAllUrls() {
    return Object.keys(this.governanceFiles)
  }

  /**
   * retrieves and sets the storage to contain all degov files in the input array and saves state locally
   * @param urls a string array of urls to track
   */
  public async setFiles(urls: string[]) {
    const files = await this.fetch.fetchAll(urls)
    files.map((file, index) => {
      const lastFetched = new Date()
      const GovFile = JSON.parse(file)
      this.governanceFiles[urls[index]] = { GovFile, lastFetched, active: true }
    })
    await this.setInternalState(this.governanceFiles)
  }

  /**
   * remove a file from the storage
   * @param url The url of the file to remove
   */
  public async removeFile(url: string) {
    if (this.governanceFiles[url]) {
      delete this.governanceFiles[url]
      await this.setInternalState(this.governanceFiles)
    } else {
      throw Error("File does not exist")
    }
  }
  /**
   * add a file to storage
   * @param url The url of the file to add
   */
  public async addFile(url: string) {
    try {
      const GovFile = await this.fetchFile(url)
      const lastFetched = new Date()
      this.governanceFiles[url] = { GovFile, lastFetched, active: true }
      await this.setInternalState(this.governanceFiles)
    } catch (e) {
      console.log(`Could not add governance file at url ${url}. Reason: ${e}`)
    }
  }
  /**
   * get the file for this url and check the ttl time to determine if refetch needs to occur
   * @param url the url of the file to get
   * @throws Error when the file does not exist or cannot be fetched
   * @returns the governance file
   */
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
      throw Error(
        `File with url ${url} does not exist, make sure to add file before trying to get it`
      )
    }
  }
  /**
   * check the did against all active degov files. Refetching if the time has expired
   * @param did The did to find in the the governance files
   * @returns Boolean if the did is present in any active files
   */
  public async checkDid(did: string) {
    const files = this.getAllActiveFiles()
    for (let i = 0; i < files.length; i++) {
      const file = await this.getFile(files[i])
      if (await this.checkFileForDid(did, file)) return true
    }
    return false
  }

  /**
   * Whether a governance file is active given the url that it lives at
   * @param url the url string that denotes the location of the governance file
   * @returns true or false is the file is active
   */
  public isActiveFile(url: string): boolean {
    this.getFile(url)
    const active = this.governanceFiles[url].active
    return active
  }

  /**
   * Retrieves all active governance files in the interpreter
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
   * Retrieves all inactive governance files in the interpreter
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
   * This function internally sets the Governance file to active and saves the state locally
   * @param url The url string that denotes the location of the governance file
   */
  public async activateGovFile(url: string) {
    const file = this.governanceFiles[url]
    this.governanceFiles[url] = { ...file, active: true }
    await this.setInternalState(this.governanceFiles)
  }

  /**
   * This function internally sets the Governance file to inactive and saves the state locally
   * @param url The url string that denotes the location of the governance file
   */
  public async deactivateGovFile(url: string) {
    const file = this.governanceFiles[url]
    this.governanceFiles[url] = { ...file, active: false }
    await this.setInternalState(this.governanceFiles)
  }

  //fetch the file from the given url and update the storage
  private async refetchFile(url: string): Promise<GovernanceFile> {
    const GovFile = await this.fetchFile(url)
    const lastFetched = new Date()
    this.governanceFiles[url] = {
      GovFile,
      lastFetched,
      active: this.governanceFiles[url].active,
    }
    return GovFile
  }

  private async setInternalState(value: GovernanceFiles) {
    await this.internalStorage.setItem(savedKey, JSON.stringify(value))
  }

  private async fetchFile(url: string): Promise<GovernanceFile> {
    const lastFetched = new Date()
    const response = await this.fetch.fetchUrl(url)
    let GovFile = JSON.parse(response) as
      | GovernanceFile
      | { governance: string }
    if ("governance" in GovFile)
      GovFile = await this.verifyJWT(GovFile.governance)
    this.governanceFiles[url] = { GovFile, lastFetched, active: true }
    return GovFile
  }

  private async verifyJWT(JWT: string): Promise<GovernanceFile> {
    const arr = JWT.split(".")
    const header = JSON.parse(
      Buffer.from(arr[0]).toString("utf-8")
    ) as JWTHeader
    if (!this.resolver)
      throw Error("Cannot validate JWT because no Did resolver was provided")
    const didUrl = header.kid.split("#")
    const did = didUrl[0]
    const verificationId = didUrl[1]
    const doc = await this.resolver(did)
    const verificationMethod = doc.verificationMethod?.find((method) => {
      method.id == verificationId
    })
    if (!verificationMethod)
      throw Error(
        "Cannot validate JWT because matching verification method could not be found in didDoc"
      )
    const key = getKey(verificationMethod)
    const didDocStr = Buffer.from(arr[1], "base64")
    const verified = key.verifySignature({
      message: didDocStr,
      signature: Buffer.from(arr[2], "base64"),
      sigType: SigAlgs.EdDSA,
    })

    if (verified) {
      return JSON.parse(Buffer.from(didDocStr).toString("utf-8"))
    }

    throw Error("Could not verify JWT, signature validation failed.")
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
  /**
   * Removes all files from the interpreter
   */
  public async removeAllFiles() {
    this.governanceFiles = {}
    await this.setInternalState(this.governanceFiles)
  }
}
