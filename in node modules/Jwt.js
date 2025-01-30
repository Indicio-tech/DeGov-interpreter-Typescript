"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJwt = void 0;
const buffer_1 = require("buffer");
function decodeJwt(jwtToken) {
    // this line was written directly by me which is why it acts differently - it is, however, the same line that is in the degov enterpreter before it gets packed
    let decoded
    decoded = JSON.parse(atob(jwtToken.split('.')[1]))
    // this line is what is spat out when we pack the package, for some reason it breaks it
    // return JSON.parse(atob(jwtToken.split('.')[1]));
    // JSON.parse((0, buffer_1.atob)(jwtToken.split('.')[1]));
    return decoded
}
exports.decodeJwt = decodeJwt;
//# sourceMappingURL=Jwt.js.map



"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJwt = void 0;
function decodeJwt(jwtToken) {
    let decoded
    if (jwtToken) {
        decoded = JSON.parse(atob(jwtToken.split('.')[1]));
    return decoded;
    }
    else console.warn('invalid token')
}
exports.decodeJwt = decodeJwt;