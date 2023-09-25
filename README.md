# bun-luau-loader

Allows to import lua/luau files in TypeScript. Requires Lune.

```lua
-- module.luau
return {
  SomeKey = "SomeValue"
}
```

```ts
// index.ts
import { SomeKey } from "./module.luau"
```
