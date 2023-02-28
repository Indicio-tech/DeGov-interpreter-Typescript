import { DegovService } from "../services/DegovService";
import fetch from "node-fetch";
import fetchMock from "jest-fetch-mock";
import governance from "./ExampleDegov.json";

const fetcher = fetch;
fetchMock.enableMocks();
const service = new DegovService(fetcher);

beforeEach(() => {
  fetchMock.resetMocks();
});

test("Test if we can find the did in a governance file", () => {
  fetchMock.mockResponse(JSON.stringify(governance));
  service.addFile("test.com");
  // expect(service.checkDid("U9FXudo8rdCgsrpQ5EG2YY")).toBe(true);
});
