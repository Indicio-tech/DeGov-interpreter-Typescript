import { DegovService } from "../services/DegovService"
import { WebStorage } from "../utils"
import { governance, jwtGovernance } from "./test.Governance"
import type fetch from "node-fetch"
import { Response, RequestInfo } from "node-fetch"
import fs from "fs/promises"

const fetcher = jest.fn(
  (url: string) =>
    new Promise((res) => res(new Response(JSON.stringify(governance))))
) as (url: RequestInfo) => Promise<Response>

const jwtFetcher = jest.fn(
  (url: string) =>
    new Promise((res) => res(new Response(JSON.stringify(jwtGovernance))))
) as (url: RequestInfo) => Promise<Response>

const service = new DegovService(fetcher as typeof fetch, new WebStorage(fs))
const jwtService = new DegovService(
  jwtFetcher as typeof fetch,
  new WebStorage(fs)
)

beforeAll(async () => {
  await service.init()
})

beforeEach(async () => {
  await service.addFile("test.com")
})

afterEach(async () => {
  await service.removeAllFiles()
})

afterAll(async () => {
  await fs.rm("./DegovStorage/WebStorage.json")
  await fs.rmdir("./DegovStorage")
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

test("retreive the entire Governance file", async () => {
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

test("JWT verifcation", async () => {})
