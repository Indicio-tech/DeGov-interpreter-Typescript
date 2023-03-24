import { DegovService } from "../services/DegovService";
import { governance } from "./test.Governance";
import type fetch from "node-fetch";
import { Response } from "node-fetch";

const fetcher = jest.fn(
  (url: string) =>
    new Promise((res) => res(new Response(JSON.stringify(governance))))
) as (url: RequestInfo) => Promise<Response>;

const service = new DegovService(fetcher as typeof fetch);

beforeEach(async () => {
  await service.addFile("test.com");
});

afterEach(async () => {
  await service.removeFile("test.com");
});

test("Test if we can find the did in a governance file", async () => {
  expect(await service.checkDid("U9FXudo8rdCgsrpQ5EG2YY")).toBe(true);
});

test("retreive the entire Governance file", async () => {
  expect(await service.getFile("test.com")).toEqual(governance);
});

test("Remove a file that does not exist", () => {
  expect(() => service.removeFile("test2.com")).toThrow("File does not exist");
});

test("Ensure a file that is added is saved", async () => {
  await service.addFile("newFile.com");
  expect(await service.getFile("newFile.com")).toEqual(governance);
});

test("Attempt to get a file that does not exist", async () => {
  await expect(service.getFile("test2")).rejects.toThrow("File does not exist");
});
