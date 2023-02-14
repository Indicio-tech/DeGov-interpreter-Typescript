export interface GovernanceFile {
    '@context': string[]
    author: string
    name: string
    version: string
    format: string
    id: UUID
    uri: string
    description: string
    last_updated: number | Date
    ttl: number
    docs_uri: string
    schemas: Schema[]
    [property: string | number | symbol]: any
}

export interface Schema {
    id: SchemaId
    name: string
}

export interface Participant  {
    id: UUID
    author: string
    created: Date
    version: string
    topic: string
    entries: {[schemaUri: JsonURI] : ParticipantEntry}
}

export interface ParticipantEntry {
    [key: string] : Entry
}

export interface Entry {
    [did: string] : {
        roles : string[]
    }
}

// Testing out pattern string types
type SchemaId = `${string}:${number}:${string}:${number}`

type UUID = `${string}-${string}-${string}-${string}-${string}`

type JsonURI = `${'http://' | 'https://'}${string}${'.json'}`