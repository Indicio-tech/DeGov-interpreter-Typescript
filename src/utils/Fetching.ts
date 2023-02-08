import axios, { AxiosResponse } from 'axios'
import { GovernanceFile } from '../types'

export async function fetch(url: string): Promise<GovernanceFile> {
    const result: AxiosResponse = await axios.get(url)
    return JSON.parse(result.data) as GovernanceFile //strip file from response and return
}

export async function fetchAll(urls: string[]): Promise<string[]> {
    const result = await Promise.all(urls.map(async (s: string) => {
        return await (await fetch(s)).data
    }))
    return result
}