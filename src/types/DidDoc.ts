export interface VerificationMethod {
  id: string
  type: string
  controller: string
  publicKeyBase58?: string
  publicKeyBase64?: string
  publicKeyJwk?: {
    kty: string
    use?: string
    [key: string]: unknown
  }
  publicKeyHex?: string
  publicKeyMultibase?: string
  publicKeyPem?: string
  blockchainAccountId?: string
  ethereumAddress?: string
}

export interface DidDocument {
  context?: string | string[]
  id: string
  alsoKnownAs?: string[]
  controller?: string | string[]
  verificationMethod?: VerificationMethod[]
  service?: Record<string, unknown>[]
  authentication?: Array<string | VerificationMethod>
  assertionMethod?: Array<string | VerificationMethod>
  keyAgreement?: Array<string | VerificationMethod>
  capabilityInvocation?: Array<string | VerificationMethod>
  capabilityDelegation?: Array<string | VerificationMethod>
}
