import { GovernanceFile } from "../types";
import { Fetching } from "../utils";
import type fetch from "node-fetch";
import { nodeFetching } from "../utils/nodeFetching";
import { axiosFetching } from "../utils/axiosFetching"
import axios from "axios";

export interface governanceFiles{
    [degGovUrl: string]: { GovFile: GovernanceFile, lastFetched: Date }
}

export class degovService {
    private governanceFiles: governanceFiles = {}
    private fetch: Fetching | undefined
    public constructor(someFetch?: typeof fetch, someAxios?: typeof axios){
        if(someFetch)
            this.fetch = new nodeFetching(someFetch)
        if(someAxios && !this.fetch)
            this.fetch = new axiosFetching(axios)
        if(!this.fetch)
            throw new Error("must define some form of fethc or axios")

    }
    //retreives and sets the storage to conatin all degov files in the input array
    public async setFiles(urls: [string]){
        const files = await this.fetch!.fetchAll(urls)
        files.map((file, index) => {
            //add each file to the object with url as key
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
        const response = await this.fetch!.fetchUrl(url)
        const GovFile = JSON.parse(response) as GovernanceFile
        this.governanceFiles[url] = { GovFile, lastFetched }
        return GovFile
    }
}