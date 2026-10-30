import * as api from "../index";

test("the package entry point exports the public API", () => {
  expect(typeof api.DegovService).toBe("function");
  expect(typeof api.Fetching).toBe("function");
  expect(typeof api.WebStorage).toBe("function");
  expect(typeof api.ReactNativeStorage).toBe("function");
});
