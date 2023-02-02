export interface governanceFile {
    context: [string]
    author: string
    name: string
    version: string
    format: string
    id: string
    uri: string
    description: string
    lastUpdated: Date
    ttl: number
    docsUri: string
    schemas: [schema]
}

export interface schema {
    id:string
    name: string
}

export interface participant  {
    id: string
    author: string
    created: Date
    version: string
    topic: string
    entries: {[schemaUri: string] : participantEntry}
}

export interface participantEntry {
    [key: string] : entry
}

export interface entry {
    [did: string] : {
        roles : [string]
    }
}