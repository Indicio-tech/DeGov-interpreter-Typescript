//COPYRIGHT 2023 IndicioPBC
import type fetch from "node-fetch"
import https from "https"

export class Fetching {
  private fetch: typeof fetch

  public constructor(fetching: typeof fetch) {
    this.fetch = fetching
  }

  public async fetchUrl(url: string): Promise<string> {
    const result = await this.fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      // This allows us to get a governance file from a self signed cert but is a major security issue
      // TODO: Remove this
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
    if (result.status == 200)
      return result.text() //strip file from response and return
    else
      throw new Error(
        `An error occurred fetching from ${url}, status code: ${result.status}`
      )
  }

  public async fetchAll(urls: string[]): Promise<string[]> {
    const result = await Promise.all(
      urls.map(async (s: string) => {
        const response = await this.fetchUrl(s)
        return response
      })
    )
    return result
  }
}
