import { JWTValidator } from "./JWTValidator"
import type { decode, sign } from "react-native-pure-jwt"

export interface ReactNativeValidator {
  decode: typeof decode
  sign: typeof sign
}

export class ReactNativeJWT implements JWTValidator {
  private validator: ReactNativeValidator

  constructor(validator: ReactNativeValidator) {
    this.validator = validator
  }

  async getKid(JWT: string): Promise<string> {
    const decoded = await this.validator.decode(JWT, "", {
      skipValidation: true,
    })
    const header = decoded.headers as { [key: string]: any }
    const kid = header["kid"] as string | undefined

    if (!kid)
      throw Error(
        `Cannot process JWT, kid not included in headers. Headers: ${header}`
      )
    return kid
  }
  async getPayload(JWT: string): Promise<string> {
    const decoded = await this.validator.decode(JWT, "", {
      skipValidation: true,
    })

    return JSON.stringify(decoded.payload)
  }

  async validate(JWT: string, key: string): Promise<Boolean> {
    try {
      const decoded = await this.validator.decode(JWT, key)
      return true
    } catch (error) {
      console.log(`Could not validate JWT, error: ${error}`)
      return false
    }
  }
}
