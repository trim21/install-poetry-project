import { hashString } from "../src/utils";

test("get poetry version", async () => {
  expect(hashString("")).toBeTruthy();
});
