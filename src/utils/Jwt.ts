import { atob } from "buffer"

export function decodeJwt(jwtToken: string) {
    let decoded
    if (jwtToken) {
        decoded = JSON.parse(atob(jwtToken.split('.')[1]));
    return decoded;
    }
    else console.warn('invalid token')
};