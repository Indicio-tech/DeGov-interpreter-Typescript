import { GovernanceFile, JsonURI } from "../types";
import type fetch from "node-fetch";
import { Fetching } from "../utils";

export interface governanceFiles{
    [degGovUrl: string]: { GovFile: GovernanceFile, lastFetched: Date }
}

export class degovService {
    private governanceFiles: governanceFiles = {}
    private fetch: Fetching
    public constructor(Fetch: typeof fetch){
        this.fetch = new Fetching(Fetch)
    }
    //retreives and sets the storage to conatin all degov files in the input array
    public async setFiles(urls: [string]){
        const files = await this.fetch.fetchAll(urls)
        files.map((file, index) => {
            const lastFetched = new Date()
            const GovFile = JSON.parse(file)
           this.governanceFiles[urls[index]] = {GovFile, lastFetched}
        })
    }
    //remove a file from the storage
    public async removeFile(url: string){
        delete this.governanceFiles[url]
    }
    //add a file to storage
    public async addFile(url: string){
        const GovFile = await this.fetchFile(url)
        const lastFetched = new Date()
        this.governanceFiles[url] = { GovFile, lastFetched }
    }
    //get the file for this url and check the ttl time to determine if refetch needs to occur
    public async getFile(url: string){
        let GovFile: GovernanceFile = this.governanceFiles[url].GovFile
        const last = this.governanceFiles[url].lastFetched
        const ttl = GovFile.ttl
        const lastFetched: Date = new Date()
        if(lastFetched.getMinutes() - last.getMinutes() > ttl ) {
            return await this.refetchFile(url)
        }
        return GovFile
    }
    //check the did against all degov files. Refetching if the time has expired
    public async checkDid(did: string){
        
    }
    //fetch the file from the given url and update the storage
    private async refetchFile(url: string): Promise<GovernanceFile> {
        const GovFile = await this.fetchFile(url)
        const lastFetched = new Date()
        this.governanceFiles[url] = { GovFile, lastFetched}
        return GovFile
    }

    private async fetchFile(url: string): Promise<GovernanceFile>{
        const lastFetched = new Date()
        const response = await this.fetch.fetchUrl(url)
        const GovFile = JSON.parse(response) as GovernanceFile
        this.governanceFiles[url] = { GovFile, lastFetched }
        return GovFile
    }

    private async checkFileForDid(did: string, degov: GovernanceFile){
        const entries = degov.participants.entries
        for(const prop in entries) {
            const entry = entries[prop as JsonURI]
            const found = entry[did]
            if(found) return true
        }
    }
}