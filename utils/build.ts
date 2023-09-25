import plugin from "../src/index";

export async function buildFromSource(entrypoint: string): Promise<void> {
  const out = await Bun.build({
    plugins: [plugin],
    entrypoints: [entrypoint],
  });

  if (out.success) {
    eval(await out.outputs[0].text());

    Promise.resolve();
  } else {
    console.warn("Build failed:");
    console.warn(out.logs.map((v) => "     " + v.message).join("\n"));

    Promise.reject("failed to build");
  }
}
