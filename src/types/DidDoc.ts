import { Jwk, Key, KeyAlgs } from "@hyperledger/aries-askar-shared"
import bs58 from "bs58"

export interface VerificationMethod {
  id: string
  type: string
  controller: string
  publicKeyBase58?: string
  publicKeyBase64?: string
  publicKeyJwk?: Jwk
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

export function getKey(verificationMethod: VerificationMethod) {
  if (verificationMethod.publicKeyBase58) {
    const temp = bs58.decode(verificationMethod.publicKeyBase58)
    return Key.fromPublicBytes({ algorithm: KeyAlgs.Ed25519, publicKey: temp })
  }
  if (verificationMethod.publicKeyBase64) {
    const buf = Buffer.from(verificationMethod.publicKeyBase64, "base64")
    return Key.fromPublicBytes({ algorithm: KeyAlgs.Ed25519, publicKey: buf })
  }
  if (verificationMethod.publicKeyJwk) {
    return Key.fromJwk({ jwk: verificationMethod.publicKeyJwk })
  }
  if (verificationMethod.publicKeyHex) {
    const buf = Buffer.from(verificationMethod.publicKeyHex, "hex")
    return Key.fromPublicBytes({ algorithm: KeyAlgs.Ed25519, publicKey: buf })
  }
}
