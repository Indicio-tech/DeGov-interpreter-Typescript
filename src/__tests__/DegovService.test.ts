import { DegovService } from "../services/DegovService"
import { WebStorage } from "../utils"
import { governance } from "./test.Governance"
import type fetch from "node-fetch"
import { Response, RequestInfo } from "node-fetch"
import fs from "fs/promises"

const fetcher = jest.fn(
  (url: string) =>
    new Promise((res) => res(new Response(JSON.stringify(governance))))
) as (url: RequestInfo) => Promise<Response>

const service = new DegovService(fetcher as typeof fetch, new WebStorage(fs))

beforeAll(async () => {
  await service.init()
})

beforeEach(async () => {
  await service.setFiles(["test.com"])
})

afterEach(async () => {
  await service.removeAllFiles()
})

afterAll(async () => {
  await service.addFile("leftOver.com")
})

test("Test if state is saved after a fresh load", async () => {
  console.log(await await service.getFile("leftOver.com"))

  expect(await service.getFile("leftOver.com")).toEqual(governance)
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
