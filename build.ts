import plugin from "./src/index";

const out = await Bun.build({
  plugins: [plugin],
  entrypoints: ["./examples/run.ts"],
});

if (out.success) {
    eval(await out.outputs[0].text())
} else {
    console.warn("Build failed:")
    console.warn(out.logs.map((v) =>  "     " + v.message).join("\n"))
}