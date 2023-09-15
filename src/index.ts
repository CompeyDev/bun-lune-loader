import { BunPlugin } from "bun";

const plugin: BunPlugin = {
  name: "lune",
  async setup(build) {
    const { importPath } = await import("./loader");

    build.onLoad({ filter: /\.(luau|lua)$/ }, (args) => {
      const mod = importPath(args.path);

      return {
        contents: mod,
        loader: "json",
      };
    });
  },
};

export default plugin;