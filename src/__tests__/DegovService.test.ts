import { DegovService } from "../services/DegovService"
import { WebStorage } from "../utils"
import { governance } from "./test.Governance"
import type fetch from "node-fetch"
import { Response, RequestInfo } from "node-fetch"
import fs from "fs/promises"
import { jwtDecode } from "jwt-decode"
import { GovernanceFile } from "../types"

const fetcher = jest.fn(
  (url: string) =>
    new Promise((res) => res(new Response(JSON.stringify(governance))))
) as (url: RequestInfo) => Promise<Response>

const service = new DegovService(fetcher as typeof fetch, new WebStorage(fs))

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

test("JWT", async () => {
  const jwt = jwtDecode(
    "eyJhbGciOiAiRWREU0EiLCAidHlwIjogIkpXVCIsICJraWQiOiAiZGlkOnNvdjpIcDZMUXpVNzc0WmFoa0oyN2RocWQ5I2tleS0xIn0.eyJhdXRob3IiOiAiZGlkOmV4YW1wbGU6SHA2TFF6VTc3NFphaGtKMjdkaHFkOSIsICJkZXNjcmlwdGlvbiI6ICJNaW5pbWFsIGdvdmVybmFuY2UgZmlsZSBleGFtcGxlIiwgImRvY3NfdXJpIjogImh0dHBzOi8vZ2l0aHViLmNvbS9kZWNlbnRyYWxpemVkLWlkZW50aXR5L2NyZWRlbnRpYWwtdHJ1c3QtZXN0YWJsaXNobWVudC9ibG9iL21haW4vY3JlZGVudGlhbC10cnVzdC1lc3RhYmxpc2htZW50L3NwZWMubWQiLCAiZm9ybWF0IjogIjEuMCIsICJpZCI6ICI0Y2I1NDZmOC00ZWFlLTQyMzUtYTk3MS0yOGUwOGFhZDU2MjEiLCAibGFzdF91cGRhdGVkIjogMTcwMzE4NzQzOSwgIm5hbWUiOiAiQ1RFIEdvdmVybmFuY2UiLCAidmVyc2lvbiI6ICIxIiwgInVyaSI6ICIiLCAiY3VycmVudF92ZXJzaW9uIjogIiIsICJwcmV2aW91c192ZXJzaW9ucyI6IFtdLCAic2NoZW1hcyI6IFt7ImlkIjogIlE3Q3lxZkhzczlSUEs0aGp3eVpUMzI6MjpVc2VyOjEuMCIsICJuYW1lIjogIlVzZXIgQ3JlZGVudGlhbCJ9XSwgInBhcnRpY2lwYW50cyI6IHsiaWQiOiAiZGVmYXVsdF9wYXJ0aWNpcGFudHNfdXVpZCIsICJhdXRob3IiOiAiZGlkOmV4YW1wbGU6SHA2TFF6VTc3NFphaGtKMjdkaHFkOSIsICJjcmVhdGVkIjogMTcwMzE4NzQzOSwgInZlcnNpb24iOiAiMSIsICJ0b3BpYyI6ICJObyB0b3BpYyBwcm92aWRlZCIsICJlbnRyaWVzIjogeyJodHRwczovL2V4YW1wbGUuY29tL3JvbGVzLnNjaGVtYS5qc29uIjoge30sICJodHRwczovL2V4YW1wbGUuY29tL2Rlc2NyaXB0aW9uLnNjaGVtYS5qc29uIjoge319fSwgInJvbGVzIjoge319.XimPz7gJ01GYJEjZxXg3RE0TxmvyVgCfEyT8GTA2dPljCI2yAkTKHo-93bYIA47TAETGoD4g4PnLAZX2kao0Aw",
    { header: true }
  )
  const paylod = jwtDecode(
    "eyJhbGciOiAiRWREU0EiLCAidHlwIjogIkpXVCIsICJraWQiOiAiZGlkOnNvdjpIcDZMUXpVNzc0WmFoa0oyN2RocWQ5I2tleS0xIn0.eyJhdXRob3IiOiAiZGlkOmV4YW1wbGU6SHA2TFF6VTc3NFphaGtKMjdkaHFkOSIsICJkZXNjcmlwdGlvbiI6ICJNaW5pbWFsIGdvdmVybmFuY2UgZmlsZSBleGFtcGxlIiwgImRvY3NfdXJpIjogImh0dHBzOi8vZ2l0aHViLmNvbS9kZWNlbnRyYWxpemVkLWlkZW50aXR5L2NyZWRlbnRpYWwtdHJ1c3QtZXN0YWJsaXNobWVudC9ibG9iL21haW4vY3JlZGVudGlhbC10cnVzdC1lc3RhYmxpc2htZW50L3NwZWMubWQiLCAiZm9ybWF0IjogIjEuMCIsICJpZCI6ICI0Y2I1NDZmOC00ZWFlLTQyMzUtYTk3MS0yOGUwOGFhZDU2MjEiLCAibGFzdF91cGRhdGVkIjogMTcwMzE4NzQzOSwgIm5hbWUiOiAiQ1RFIEdvdmVybmFuY2UiLCAidmVyc2lvbiI6ICIxIiwgInVyaSI6ICIiLCAiY3VycmVudF92ZXJzaW9uIjogIiIsICJwcmV2aW91c192ZXJzaW9ucyI6IFtdLCAic2NoZW1hcyI6IFt7ImlkIjogIlE3Q3lxZkhzczlSUEs0aGp3eVpUMzI6MjpVc2VyOjEuMCIsICJuYW1lIjogIlVzZXIgQ3JlZGVudGlhbCJ9XSwgInBhcnRpY2lwYW50cyI6IHsiaWQiOiAiZGVmYXVsdF9wYXJ0aWNpcGFudHNfdXVpZCIsICJhdXRob3IiOiAiZGlkOmV4YW1wbGU6SHA2TFF6VTc3NFphaGtKMjdkaHFkOSIsICJjcmVhdGVkIjogMTcwMzE4NzQzOSwgInZlcnNpb24iOiAiMSIsICJ0b3BpYyI6ICJObyB0b3BpYyBwcm92aWRlZCIsICJlbnRyaWVzIjogeyJodHRwczovL2V4YW1wbGUuY29tL3JvbGVzLnNjaGVtYS5qc29uIjoge30sICJodHRwczovL2V4YW1wbGUuY29tL2Rlc2NyaXB0aW9uLnNjaGVtYS5qc29uIjoge319fSwgInJvbGVzIjoge319.XimPz7gJ01GYJEjZxXg3RE0TxmvyVgCfEyT8GTA2dPljCI2yAkTKHo-93bYIA47TAETGoD4g4PnLAZX2kao0Aw"
  )

  console.log(paylod as GovernanceFile)

  console.log(jwt.kid)
})
