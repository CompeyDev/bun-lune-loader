// We need to grab x.luau, then pass the return values of that to another
// function in the luau side. This function parses the table and converts
// it to a JSON object that we can then parse and serve back to the user.

import { spawnSync, which } from "bun";
import { exit } from "process";

// - Execute lune and run loader script with args for source code
// - return JSON

export function importPath(path: PathLike): string {
  const lunePath = which("lune");

  if (!lunePath) {
    throw new Error(
      "[bun-plugin-lune::loader] Cannot find `lune` executable in path",
    );
  }

  // Path to luau loader probs shouldnt be hardcoded
  const luneChild = spawnSync({
    cmd: [lunePath, "./loader.luau", path.toString(), "MODULE"],
    cwd: import.meta.dir,
    onExit(_proc, exitCode, _sigCode, err) {
      if (exitCode != 0 && exitCode != null) {
        console.warn(
          `[bun-plugin-lune::loader] \`lune\` process exited with code ${exitCode}`,
        );

        err
          ? () => {
            console.warn(
              "[bun-plugin-lune::loader] Internal error: ",
              err.message,
            );
            exit(1);
          }
          : {};
      }
    },

    stderr: "pipe",
    stdout: "pipe",
  });

  const luneStderr = luneChild.stderr.toString();

  if (luneStderr != "") {
    const fmtTrace = luneStderr.split("\n")
      .map((l) => l = "      " + l).join("");

    console.warn("\nTRACE:");
    console.warn(fmtTrace, "\n");

    exit(1);
  }

  let luneStdout = luneChild.stdout.toString().split("\n");
  let generatedJSONObject: string;

  // luneStdout format:
  // ...logs n' stuff
  // --start @generated JS compatible object--
  // ...object -- Always is in one line
  // --end @generated JS compatible object--
  // Additional newline (\n)

  // Remove the last empty padding newline
  luneStdout = luneStdout.filter((v) => v != "");
  luneStdout.every((l, n) => {
    // If the stdout line doesn't start with `--`, that means
    // it must be a log, and not the generated output
    if (l.startsWith("--")) {
      if (
        l == "--start @generated JS compatible object--" &&
        luneStdout[n + 2] == "--end @generated JS compatible object--"
      ) {
        // The third last index is the end of the generated object
        // The next index is the start of the generated object, after the comment
        generatedJSONObject = luneStdout.slice(n + 1, n + 2)[0];

        return false;
      }

      console.warn(
        "[bun-plugin-lune::loader] invalid JS object returned by internal loader.",
      );

      exit(1);
    } else if (process.env.NODE_ENV == "dev") {
      console.log(l);
    }
  });

  return generatedJSONObject!;
}
