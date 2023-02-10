import axios, { AxiosResponse } from 'axios'
import { Fetching } from "./Fetching";

export class axiosFetching extends Fetching {
  private fetch: typeof axios;
  
  public constructor(fetching: typeof axios) {
    super()
    this.fetch = fetching;
  }

  public async fetchUrl(url: string): Promise<string> {
    const result = await this.fetch.get(url)
    return result.data(); 
  }

  public async fetchAll(urls: string[]): Promise<string[]> {
    const result = await Promise.all(
      urls.map(async (s: string) => {
        const response = await this.fetchUrl(s);
        return response;
      })
    );
    return result;
  }
}