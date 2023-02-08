import { GovernanceFile } from "../types";
import { fetch, fetchAll } from "../utils";


export interface governanceFiles{
    [degGovUrl: string]: { GovFile: GovernanceFile, lastFetched: Date }
}

export class degovService {
    private governanceFiles: governanceFiles = {}
    public constructor(){
    }
    //retreives and sets the storage to conatin all degov files in the input array
    public async setFiles(urls: [string]){
        const files = await fetchAll(urls)
        files.map((file, index) => {
            //add each file to the object with url as key
        })
    }
    //remove a file from the storage
    public async removeFile(url: string){

    }
    //add a file to storage
    public async addFile(url: string){
        
    }
    //get the file for this url and check the ttl time to determine if refetch needs to occur
    public async getFile(url: string){
        //get the file for this url and check the ttl time to determine if refetch needs to occur
    }
    //check the did against all degov files. Refetching if the time has expired
    public async checkDid(did: string){
        
    }
    //fetch the file from the given url and update the storage
    private async refetchFile(url: string) {
        
    }
}