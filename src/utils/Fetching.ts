import axios, { AxiosResponse } from 'axios'
import { GovernanceFile } from '../types'

export async function fetch(url: string): Promise<AxiosResponse> {
    const result: AxiosResponse = await axios.get(url)
    return result //strip file from response and return
}

export async function fetchAll(urls: string[]): Promise<string[]> {
    const result = await Promise.all(urls.map(async (s: string) => {
        return await (await fetch(s)).data
    }))
    return result
}