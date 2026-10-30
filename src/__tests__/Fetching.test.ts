import type fetch from "node-fetch";
import { Response } from "node-fetch";
import { Fetching } from "../utils";

const mockFetch = (status: number, body: string) =>
  jest.fn(async () => new Response(body, { status }));

test("fetchUrl returns the response text on a 200", async () => {
  const fetcher = mockFetch(200, '{"a":1}');
  const result = await new Fetching(
    fetcher as unknown as typeof fetch
  ).fetchUrl("https://example.com/gov.json");

  expect(result).toBe('{"a":1}');
  expect(fetcher).toHaveBeenCalledWith("https://example.com/gov.json", {
    method: "GET",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });
});

test("fetchUrl throws with the url and status on a non-200", async () => {
  const fetching = new Fetching(mockFetch(404, "") as unknown as typeof fetch);

  await expect(
    fetching.fetchUrl("https://example.com/missing")
  ).rejects.toThrow(
    "An error occured fetching from https://example.com/missing, status code: 404"
  );
});

test("fetchAll returns results in the order of the urls", async () => {
  const fetcher = jest.fn(async (url: string) => new Response(`body:${url}`));
  const fetching = new Fetching(fetcher as unknown as typeof fetch);

  expect(await fetching.fetchAll(["a", "b", "c"])).toEqual([
    "body:a",
    "body:b",
    "body:c",
  ]);
});

test("fetchAll rejects if any single fetch fails", async () => {
  const fetcher = jest.fn(
    async (url: string) =>
      new Response("", { status: url === "bad" ? 500 : 200 })
  );
  const fetching = new Fetching(fetcher as unknown as typeof fetch);

  await expect(fetching.fetchAll(["ok", "bad"])).rejects.toThrow(
    "status code: 500"
  );
});
