export interface JWTValidator {
  getKid(JWT: string): Promise<string>
  getPayload(JWT: string): Promise<string>
  validate(JWT: string, key: string): Promise<Boolean>
}
