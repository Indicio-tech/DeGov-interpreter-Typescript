import axios, { AxiosResponse } from 'axios'

export async function fetch(url: string): Promise<AxiosResponse<any, any>> {
    const result = await axios.get(url)
    return result
}

export async function fetchAll(urls: string[]): Promise<string[]> {
    const result = await Promise.all(urls.map(async (s: string) => {
        return await (await fetch(s)).data
    }))
    return result
}