const path = require("path");
const fs = require("fs");

const index = path.resolve(__dirname, "../types/index.d.ts");
let content = fs.readFileSync(index, { encoding: "utf8" });

// We need tis due https://github.com/microsoft/TypeScript/issues/29401
content = content.replace(
  "declare class TerserPlugin<T>",
  "declare class TerserPlugin<T = TerserOptions>"
);

fs.writeFileSync(index, content);
