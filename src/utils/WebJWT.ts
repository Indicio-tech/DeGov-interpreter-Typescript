import { JWTValidator } from "./JWTValidator"
import { decode, verify } from "jsonwebtoken"

export interface WebValidator {
  decode: typeof decode
  validate: typeof verify
}

export class WebJWT implements JWTValidator {
  private validator: WebValidator
  constructor(validator: WebValidator) {
    this.validator = validator
  }

  async getKid(JWT: string): Promise<string> {
    const decoded = this.validator.decode(JWT, { complete: true })
    if (!decoded) throw Error("Could not decode JWT")
    const kid = decoded.header.kid
    if (!kid)
      throw Error(
        `Cannot process JWT, kid not included in headers. Headers: ${decoded.header}`
      )
    return kid
  }
  async getPayload(JWT: string): Promise<string> {
    const decoded = this.validator.decode(JWT)
    if (!decoded) throw Error("Could not decode JWT")
    return typeof decoded === "string" ? decoded : JSON.stringify(decoded)
  }
  async validate(JWT: string, key: string): Promise<Boolean> {
    try {
      this.validator.validate(JWT, key)
      return true
    } catch (error) {
      console.log(`Failed to validate JWT, reason: ${error}`)
      return false
    }
  }
}
