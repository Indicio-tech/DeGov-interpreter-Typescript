import axios, { AxiosResponse } from 'axios'


export abstract class Fetching {

    constructor(){
    }

    abstract fetchUrl(url: string): Promise<string> 

    abstract fetchAll(urls: string[]): Promise<string[]> 

}