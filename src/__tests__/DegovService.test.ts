import { DegovService, DidResolver } from "../services/DegovService"
import { WebStorage } from "../utils"
import { governance, jwtGovernance } from "./test.Governance"
import fetch from "node-fetch"
import { Response, RequestInfo } from "node-fetch"
import fs from "fs/promises"
import {
  Agent,
  DidsModule,
  InitConfig,
  KeyDidResolver,
} from "@aries-framework/core"
import { agentDependencies } from "@aries-framework/node"
import {
  IndyVdrIndyDidResolver,
  IndyVdrModule,
  IndyVdrSovDidResolver,
} from "@aries-framework/indy-vdr"
import { AskarModule } from "@aries-framework/askar"
import { DidDocument } from "../types"
import { ariesAskar } from "@hyperledger/aries-askar-shared"
import { indyVdr } from "@hyperledger/indy-vdr-nodejs"
import indyLedgers from "../../ledgers/indy"

const config: InitConfig = {
  label: "Degov-Agent",
  walletConfig: {
    id: "degov-wallet-id",
    key: "testKey0000000000000000000000000",
  },
}

const agent = new Agent({
  config,
  dependencies: agentDependencies,
  modules: {
    askar: new AskarModule({
      ariesAskar,
    }),
    indyVdr: new IndyVdrModule({
      indyVdr,
      networks: indyLedgers,
    }),
    dids: new DidsModule({
      resolvers: [
        new IndyVdrIndyDidResolver(),
        new KeyDidResolver(),
        new IndyVdrSovDidResolver(),
      ],
    }),
  },
})

const fetcher = jest.fn(
  (url: string) =>
    new Promise((res) => res(new Response(JSON.stringify(governance))))
) as (url: RequestInfo) => Promise<Response>

const jwtFetcher = jest.fn(
  (url: string) =>
    new Promise((res) => res(new Response(JSON.stringify(jwtGovernance))))
) as (url: RequestInfo) => Promise<Response>

const didResolver: DidResolver = async (did: string) => {
  const result = await agent.dids.resolve(did)
  if (!result.didDocument)
    throw Error(
      `Could not resolve didDocument for did: ${did}, reason: ${JSON.stringify(
        result.didResolutionMetadata
      )}`
    )
  else {
    return result.didDocument as DidDocument
  }
}

const service = new DegovService(
  fetcher as typeof fetch,
  new WebStorage(fs),
  didResolver
)
const jwtService = new DegovService(
  jwtFetcher as typeof fetch,
  new WebStorage(fs),
  didResolver
)

const realService = new DegovService(fetch, new WebStorage(fs), didResolver)

beforeAll(async () => {
  await service.init()
  await jwtService.init()
  realService.init()
  await agent.initialize()
})

beforeEach(async () => {
  await service.addFile("test.com")
})

afterEach(async () => {
  await service.removeAllFiles()
  await jwtService.removeAllFiles()
  realService.removeAllFiles()
})

afterAll(async () => {
  await fs.rm("./DegovStorage/WebStorage.json")
  await fs.rmdir("./DegovStorage")
  await agent.shutdown()
})

test("Test if state is saved after a fresh load", async () => {
  //Creating a new service and calling init will attempt to use an existing storage file
  const newService = new DegovService(
    fetcher as typeof fetch,
    new WebStorage(fs)
  )
  await newService.init()

  expect(await newService.getFile("test.com")).toEqual(governance)
})

test("Test if we can find the did in a governance file", async () => {
  expect(await service.checkDid("U9FXudo8rdCgsrpQ5EG2YY")).toBe(true)
})

test("retrieve the entire Governance file", async () => {
  expect(await service.getFile("test.com")).toEqual(governance)
})

test("Remove a file that does not exist", () => {
  expect(service.removeFile("test2.com")).rejects.toThrow("File does not exist")
})

test("Ensure a file that is added is saved", async () => {
  await service.addFile("newFile.com")
  expect(await service.getFile("newFile.com")).toEqual(governance)
  await service.removeFile("newFile.com")
})

test("Attempt to get a file that does not exist", async () => {
  await expect(service.getFile("test2")).rejects.toThrow(
    "File with url test2 does not exist"
  )
})

test("Check if a file is active in the interpreter", async () => {
  expect(service.isActiveFile("test.com")).toBeTruthy()
})

test("Test setting the file to active and inactive", async () => {
  service.deactivateGovFile("test.com")
  expect(service.isActiveFile("test.com")).toBeFalsy()
  service.activateGovFile("test.com")
  expect(service.isActiveFile("test.com")).toBeTruthy()
})

test("Get a list of all active governance files", async () => {
  await service.addFile("test2.com")
  await service.addFile("test3.com")
  service.deactivateGovFile("test.com")
  const active = service.getAllActiveFiles()

  expect(active).toMatchObject(["test2.com", "test3.com"])
  expect(service.getAllInactiveFiles()).toMatchObject(["test.com"])
  await service.removeFile("test2.com")
  await service.removeFile("test3.com")
})

test("JWT verification", async () => {
  await jwtService.addFile("test1.com")
  const file = await jwtService.getFile("test1.com")
  expect(jwtService.checkDid("did:example:round-n-proud")).toBeTruthy()
}, 30_000)

test("Fetch and process real degov file from proven", async () => {
  await realService.addFile(
    "https://proven-test-governance.indiciotech.io/governance/files/degov.json"
  )
  const file = await realService.getFile(
    "https://proven-test-governance.indiciotech.io/governance/files/degov.json"
  )
  expect(await realService.checkDid("QF7etJUSrmtMUVUNdxYfun")).toBeTruthy()
})
