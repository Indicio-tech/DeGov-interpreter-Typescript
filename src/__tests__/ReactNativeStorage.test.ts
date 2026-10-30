import type ReactStorage from "@react-native-async-storage/async-storage";
import { ReactNativeStorage } from "../utils";

const makeStorage = () => {
  const data: { [key: string]: string } = {};
  const mock = {
    setItem: jest.fn(async (k: string, v: string) => {
      data[k] = v;
    }),
    getItem: jest.fn(async (k: string) => (k in data ? data[k] : null)),
    removeItem: jest.fn(async (k: string) => {
      delete data[k];
    }),
  };
  return {
    mock,
    storage: new ReactNativeStorage(mock as unknown as typeof ReactStorage),
  };
};

test("init resolves without touching the underlying storage", async () => {
  const { mock, storage } = makeStorage();
  await expect(storage.init()).resolves.toBeUndefined();
  expect(mock.setItem).not.toHaveBeenCalled();
  expect(mock.getItem).not.toHaveBeenCalled();
});

test("setItem then getItem round-trips a value", async () => {
  const { storage } = makeStorage();
  await storage.setItem("k", "v");
  expect(await storage.getItem("k")).toBe("v");
});

test("getItem returns null for a missing key", async () => {
  const { storage } = makeStorage();
  expect(await storage.getItem("missing")).toBeNull();
});

test("deleteItem removes the value via removeItem", async () => {
  const { mock, storage } = makeStorage();
  await storage.setItem("k", "v");
  await storage.deleteItem("k");
  expect(mock.removeItem).toHaveBeenCalledWith("k");
  expect(await storage.getItem("k")).toBeNull();
});
