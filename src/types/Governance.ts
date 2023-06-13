export interface GovernanceFile {
  "@context": string[];
  author: string;
  name: string;
  version: string;
  format: string;
  id: UUID;
  uri: string;
  description: string;
  last_updated: number | Date;
  ttl: number;
  docs_uri: string;
  schemas: Schema[];
  participants: Participant;
  [property: string | number | symbol]: any;
}

export interface Schema {
  id: SchemaId;
  name: string;
  issuer_roles?: string[];
  verifier_roles?: string[];
}

export interface Participant {
  id: UUID;
  author: string;
  created: Date | number;
  version: string | number;
  topic: string;
  entries: { [schemaUri: JsonURI]: Entry };
}

export interface Entry {
  [did: string]: {};
}

// Testing out pattern string types
type SchemaId = `${string}:${number}:${string}:${number}`;

type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type JsonURI = `${"http://" | "https://"}${string}${".json"}`;
