"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DegovService = void 0;
const utils_1 = require("../utils");
const DidDoc_1 = require("../types/DidDoc");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const utils_2 = require("../utils");
const savedKey = "GovFiles";
class DegovService {
    constructor(fetcher, storage, didResolver = undefined) {
        this.governanceFiles = {};
        this.fetch = new utils_1.Fetching(fetcher);
        this.internalStorage = storage;
        this.resolver = didResolver;
    }
    /**
     * Attempts to retrieve files from storage and resume previous state
     */
    async init() {
        try {
            require("@hyperledger/aries-askar-nodejs");
        }
        catch (_a) {
            try {
                require("@hyperledger/aries-askar-react-native");
            }
            catch (_b) {
                throw new Error("Could not load Aries Askar Bindings");
            }
        }
        await this.internalStorage.init();
        const retrieved = await this.internalStorage.getItem(savedKey);
        if (retrieved) {
            this.governanceFiles = JSON.parse(retrieved);
            Object.entries(this.governanceFiles).forEach((curr, index) => {
                this.governanceFiles[curr[0]] = Object.assign(Object.assign({}, this.governanceFiles[curr[0]]), { lastFetched: new Date(curr[1].lastFetched) });
            });
        }
    }
    getAllUrls() {
        return Object.keys(this.governanceFiles);
    }
    /**
     * retrieves and sets the storage to contain all degov files in the input array and saves state locally
     * @param urls a string array of urls to track
     */
    async setFiles(urls) {
        const files = await this.fetch.fetchAll(urls);
        files.map((file, index) => {
            const lastFetched = new Date();
            const GovFile = JSON.parse(file);
            this.governanceFiles[urls[index]] = { GovFile, lastFetched, active: true };
        });
        await this.setInternalState(this.governanceFiles);
    }
    /**
     * remove a file from the storage
     * @param url The url of the file to remove
     * @returns Boolean indicating if the operation was a success
     */
    async removeFile(url) {
        if (this.governanceFiles[url]) {
            delete this.governanceFiles[url];
            await this.setInternalState(this.governanceFiles);
            return true;
        }
        else {
            throw Error("File does not exist");
        }
    }
    /**
     * add a file to storage
     * @param url The url of the file to add
     * @returns Boolean indicating if the operation was a success
     */
    async addFile(url) {
        try {
            const GovFile = await this.fetchFile(url);
            const lastFetched = new Date();
            this.governanceFiles[url] = { GovFile, lastFetched, active: true };
            await this.setInternalState(this.governanceFiles);
            return true;
        }
        catch (e) {
            console.log(`Could not add governance file at url ${url}. Reason: ${e}`);
            return false;
        }
    }
    /**
     * get the file for this url and check the ttl time to determine if refetch needs to occur
     * @param url the url of the file to get
     * @throws Error when the file does not exist or cannot be fetched
     * @returns the governance file
     */
    async getFile(url) {
        if (this.governanceFiles[url]) {
            let encoded = this.governanceFiles[url].GovFile;
            let GovFile = (0, utils_2.decodeJwt)(encoded.governance);
            const last = this.governanceFiles[url].lastFetched;
            const ttl = GovFile.ttl;
            const lastFetched = new Date();
            if (lastFetched.getMinutes() - last.getMinutes() > ttl) {
                return await this.refetchFile(url);
            }
            return GovFile;
        }
        else {
            throw Error(`File with url ${url} does not exist, make sure to add file before trying to get it`);
        }
    }
    /**
     * check the did against all active degov files. Refetching if the time has expired
     * @param did The did to find in the the governance files
     * @returns Boolean if the did is present in any active files
     */
    async checkDid(did) {
        const files = this.getAllActiveFiles();
        for (let i = 0; i < files.length; i++) {
            const file = await this.getFile(files[i]);
            if (await this.checkFileForDid(did, file))
                return true;
        }
        return false;
    }
    /**
     * Whether a governance file is active given the url that it lives at
     * @param url the url string that denotes the location of the governance file
     * @returns true or false is the file is active
     */
    isActiveFile(url) {
        this.getFile(url);
        const active = this.governanceFiles[url].active;
        return active;
    }
    /**
     * Retrieves all active governance files in the interpreter
     * @returns An array of url strings for the active files in the interpreter
     */
    getAllActiveFiles() {
        const filtered = Object.entries(this.governanceFiles).filter((file) => {
            return file[1].active;
        });
        const mapped = filtered.map((file) => file[0]);
        return mapped;
    }
    /**
     * Retrieves all inactive governance files in the interpreter
     * @returns An array of url strings for the inactive files in the interpreter
     */
    getAllInactiveFiles() {
        return Object.entries(this.governanceFiles)
            .filter((file) => {
            return !file[1].active;
        })
            .map((file) => file[0]);
    }
    /**
     * This function internally sets the Governance file to active and saves the state locally
     * @param url The url string that denotes the location of the governance file
     */
    async activateGovFile(url) {
        const file = this.governanceFiles[url];
        this.governanceFiles[url] = Object.assign(Object.assign({}, file), { active: true });
        await this.setInternalState(this.governanceFiles);
    }
    /**
     * This function internally sets the Governance file to inactive and saves the state locally
     * @param url The url string that denotes the location of the governance file
     */
    async deactivateGovFile(url) {
        const file = this.governanceFiles[url];
        this.governanceFiles[url] = Object.assign(Object.assign({}, file), { active: false });
        await this.setInternalState(this.governanceFiles);
    }
    //fetch the file from the given url and update the storage
    async refetchFile(url) {
        const GovFile = await this.fetchFile(url);
        const lastFetched = new Date();
        this.governanceFiles[url] = {
            GovFile,
            lastFetched,
            active: this.governanceFiles[url].active,
        };
        return GovFile;
    }
    async setInternalState(value) {
        await this.internalStorage.setItem(savedKey, JSON.stringify(value));
    }
    async fetchFile(url) {
        const lastFetched = new Date();
        const response = await this.fetch.fetchUrl(url);
        let GovFile = JSON.parse(response);
        if ("governance" in GovFile)
            GovFile = await this.verifyJWT(GovFile.governance);
        this.governanceFiles[url] = { GovFile, lastFetched, active: true };
        return GovFile;
    }
    async verifyJWT(JWT) {
        var _a;
        const arr = JWT.split(".");
        const header = JSON.parse(Buffer.from(arr[0], "base64").toString());
        if (!this.resolver)
            throw Error("Cannot validate JWT because no Did resolver was provided");
        const didUrl = header.kid.split("#");
        const did = didUrl[0];
        const verificationId = didUrl[1];
        const doc = await this.resolver(did);
        const verificationMethod = (_a = doc.verificationMethod) === null || _a === void 0 ? void 0 : _a.find((method) => {
            if (method.id === header.kid || method.id === verificationId)
                return true;
        });
        if (!verificationMethod)
            throw Error("Cannot validate JWT because matching verification method could not be found in didDoc");
        const key = (0, DidDoc_1.getKey)(verificationMethod);
        const govFile = Buffer.from(arr[1], "base64");
        const payload = arr[0] + "." + arr[1];
        const signedPayload = new Uint8Array(Buffer.from(payload));
        const verified = key.verifySignature({
            message: signedPayload,
            signature: new Uint8Array(Buffer.from(arr[2], "base64url")),
            sigType: aries_askar_shared_1.SigAlgs.EdDSA,
        });
        if (verified) {
            return JSON.parse(govFile.toString());
        }
        else {
            throw Error("Could not verify JWT, signature validation failed.");
        }
    }
    async checkFileForDid(did, degov) {
        const entries = degov.participants.entries;
        for (const prop in entries) {
            const entry = entries[prop];
            const found = entry[did];
            if (found)
                return true;
        }
        return false;
    }
    /**
     * Removes all files from the interpreter
     */
    async removeAllFiles() {
        this.governanceFiles = {};
        await this.setInternalState(this.governanceFiles);
    }
}
exports.DegovService = DegovService;
//# sourceMappingURL=DegovService.js.map