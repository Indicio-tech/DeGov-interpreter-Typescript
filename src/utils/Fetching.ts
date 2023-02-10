import type fetch from "node-fetch";


export class Fetching{
  private fetch: typeof fetch;
  
  public constructor(fetching: typeof fetch) {
    this.fetch = fetching;
  }

  public async fetchUrl(url: string): Promise<string> {
    const result = await this.fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return result.text(); //strip file from response and return
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
