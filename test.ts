import { TestRunner } from "./tests/runner";

await new TestRunner({
  collection: {
    "import": "./tests/import.test.ts",
  },
})
  .run();
