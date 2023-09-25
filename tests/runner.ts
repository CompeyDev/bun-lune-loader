import { buildFromSource as build } from "../utils/build";

export class TestRunner {
  private tests: Record<string, string>;
  private dryRun: boolean;
  private ignoreFail: boolean;
  private callback: (
    meta: { name: string; success: boolean; timeElapsed: number },
  ) => void;

  constructor(opts: {
    dryRun?: boolean;
    ignoreFail?: boolean;
    collection: Record<string, string>;
    callback?: (meta: { name: string; success: boolean }) => void;
  }) {
    this.tests = opts.collection;
    this.dryRun = opts.dryRun ?? false;
    this.ignoreFail = opts.ignoreFail ?? false;
    this.callback = ({ name, success, timeElapsed }) => opts.callback ?? {
      console.log(
        `${
          success ? "[OK]" : "[FAILED]"
        } tests::${name}    ...(${timeElapsed}ms)`,
      );
    };
  }

  async run() {
    console.log(`Running ${Object.keys(this.tests).length} tests...`)

    for (let testName in this.tests) {
      const callbackOpts = {
        name: testName,
        success: true,
        timeElapsed: 0,
      };

      const startTime = performance.now();

      if (!this.dryRun) {
        // Build and execute test from source
        let testFailed: boolean;

        await build(this.tests[testName]).catch(() => {
          // Test failed
          testFailed = true;

          this.callback({
            ...callbackOpts,
            timeElapsed: Number((performance.now() - startTime).toFixed(2)),
            success: this.ignoreFail ? true : false,
          });
        }).then(() => {
          !testFailed
            ? this.callback({
              ...callbackOpts,
              timeElapsed: Number((performance.now() - startTime).toFixed(2)),
            })
            : {};
        });
      } else {
        this.callback(callbackOpts);
      }
    }
  }
}
