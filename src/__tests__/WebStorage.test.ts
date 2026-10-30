import type promises from "fs/promises";
import { WebStorage } from "../utils";

const file = "./DegovStorage/WebStorage.json";

const makeFs = (contents: string | null = null) => {
  const mock = {
    access: jest.fn(async () => {
      throw new Error("ENOENT");
    }),
    mkdir: jest.fn(async () => undefined),
    open: jest.fn(async () => undefined),
    writeFile: jest.fn(async () => undefined),
    readFile: jest.fn(async () => {
      if (contents === null) throw new Error("ENOENT");
      return contents;
    }),
  };
  return { mock, storage: new WebStorage(mock as unknown as typeof promises) };
};

test("init creates the directory and file when they do not exist", async () => {
  const { mock, storage } = makeFs();
  await storage.init();
  expect(mock.mkdir).toHaveBeenCalledWith("./DegovStorage");
  expect(mock.open).toHaveBeenCalledWith(file, "w");
});

test("init does not recreate the directory and file when they exist", async () => {
  const { mock, storage } = makeFs();
  mock.access.mockResolvedValue(undefined as never);
  await storage.init();
  expect(mock.mkdir).not.toHaveBeenCalled();
  expect(mock.open).not.toHaveBeenCalled();
});

test("setItem writes all items as JSON to the storage file", async () => {
  const { mock, storage } = makeFs();
  await storage.setItem("a", "1");
  await storage.setItem("b", "2");
  expect(mock.writeFile).toHaveBeenLastCalledWith(
    file,
    JSON.stringify({ a: "1", b: "2" }),
    "utf-8"
  );
});

test("setItem swallows write errors and logs them", async () => {
  const { mock, storage } = makeFs();
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  mock.writeFile.mockRejectedValue(new Error("disk full"));
  await expect(storage.setItem("a", "1")).resolves.toBeUndefined();
  expect(log).toHaveBeenCalledWith(
    "Failed to set item with Error: ",
    "disk full"
  );
  log.mockRestore();
});

test("getItem reads the value from the file", async () => {
  const { storage } = makeFs(JSON.stringify({ a: "1" }));
  expect(await storage.getItem("a")).toBe("1");
});

test("getItem returns null when the file is missing, empty or invalid", async () => {
  expect(await makeFs(null).storage.getItem("a")).toBeNull();
  expect(await makeFs("").storage.getItem("a")).toBeNull();
  expect(await makeFs("{not json").storage.getItem("a")).toBeNull();
});

test("deleteItem removes the key and rewrites the file", async () => {
  const { mock, storage } = makeFs();
  await storage.setItem("a", "1");
  await storage.setItem("b", "2");
  await storage.deleteItem("a");
  expect(mock.writeFile).toHaveBeenLastCalledWith(
    file,
    JSON.stringify({ b: "2" })
  );
});
