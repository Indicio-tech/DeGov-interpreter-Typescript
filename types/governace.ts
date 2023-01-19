type governanceFile = {
    author: string
    id: string
    name: string
    description: string
    version: string
    format: string
    docsUri: string
    lastUpdated: Date
    context: [string]
    schemas: [schema]
}

type schema = {
    id:string
    name: string
    issuerRoles: [string]
}

type participant = {
    id: string
    author: string
    created: Date
    version: string
    topic: string
}

type participantEntry = {
    
}