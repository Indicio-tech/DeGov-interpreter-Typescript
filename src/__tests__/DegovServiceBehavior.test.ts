import type fetch from "node-fetch";
import { Response } from "node-fetch";
import { DegovService, InternalStorage } from "../index";
import { governance } from "./test.Governance";

const makeStorage = (): InternalStorage & { data: { [k: string]: string } } => {
  const data: { [k: string]: string } = {};
  return {
    data,
    init: async () => {},
    setItem: async (k, v) => {
      data[k] = v;
    },
    getItem: async (k) => (k in data ? data[k] : null),
    deleteItem: async (k) => {
      delete data[k];
    },
  };
};

const makeFetcher = (gov: object = governance, status = 200) =>
  jest.fn(async () => new Response(JSON.stringify(gov), { status }));

const asFetch = (f: unknown) => f as typeof fetch;

afterEach(() => {
  jest.useRealTimers();
});

test("setFiles fetches every url and marks the files active", async () => {
  const service = new DegovService(asFetch(makeFetcher()), makeStorage());
  await service.setFiles(["a.com", "b.com"]);
  expect(service.getAllUrls()).toEqual(["a.com", "b.com"]);
  expect(service.getAllActiveFiles()).toEqual(["a.com", "b.com"]);
});

test("state persists activation changes across a fresh init", async () => {
  const storage = makeStorage();
  const first = new DegovService(asFetch(makeFetcher()), storage);
  await first.addFile("a.com");
  await first.addFile("b.com");
  await first.deactivateGovFile("b.com");

  const second = new DegovService(asFetch(makeFetcher()), storage);
  await second.init();
  expect(second.getAllActiveFiles()).toEqual(["a.com"]);
  expect(second.getAllInactiveFiles()).toEqual(["b.com"]);
});

test("init with empty storage leaves the service empty", async () => {
  const service = new DegovService(asFetch(makeFetcher()), makeStorage());
  await service.init();
  expect(service.getAllUrls()).toEqual([]);
});

test("checkDid ignores inactive files", async () => {
  const service = new DegovService(asFetch(makeFetcher()), makeStorage());
  await service.addFile("a.com");
  await service.deactivateGovFile("a.com");
  expect(await service.checkDid("U9FXudo8rdCgsrpQ5EG2YY")).toBe(false);
});

test("checkDid returns false for a did that is not in any file", async () => {
  const service = new DegovService(asFetch(makeFetcher()), makeStorage());
  await service.addFile("a.com");
  expect(await service.checkDid("did:example:unknown")).toBe(false);
});

test("addFile rejects when the fetch returns a non-200", async () => {
  const service = new DegovService(
    asFetch(makeFetcher(governance, 500)),
    makeStorage()
  );
  await expect(service.addFile("a.com")).rejects.toThrow("status code: 500");
});

test("removeAllFiles empties the service and the saved state", async () => {
  const storage = makeStorage();
  const service = new DegovService(asFetch(makeFetcher()), storage);
  await service.addFile("a.com");
  await service.removeAllFiles();
  expect(service.getAllUrls()).toEqual([]);
  expect(JSON.parse(storage.data["GovFiles"])).toEqual({});
});

// Characterization of current behavior: getFile compares the *minute-of-hour*
// difference to ttl, so a refetch only happens when that difference exceeds ttl.
test("getFile does not refetch while the ttl has not expired", async () => {
  const fetcher = makeFetcher();
  const service = new DegovService(asFetch(fetcher), makeStorage());
  await service.addFile("a.com");
  await service.getFile("a.com");
  expect(fetcher).toHaveBeenCalledTimes(1);
});

test("getFile refetches once the ttl has expired", async () => {
  jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
  jest.setSystemTime(new Date("2026-01-01T10:00:00Z"));
  const fetcher = makeFetcher({ ...governance, ttl: 0 });
  const service = new DegovService(asFetch(fetcher), makeStorage());
  await service.addFile("a.com");

  jest.setSystemTime(new Date("2026-01-01T10:05:00Z"));
  await service.getFile("a.com");
  expect(fetcher).toHaveBeenCalledTimes(2);
});
