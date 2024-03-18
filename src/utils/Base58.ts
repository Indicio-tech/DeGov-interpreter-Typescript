import base from "@multiformats/base-x"

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

const base58 = base(BASE58_ALPHABET)

export function decodeBase58(base58str: string) {
  return base58.decode(base58str)
}
