const fs = require("fs");
const path = require("path");
const ts = require("./frontend/node_modules/typescript");

const root = process.cwd();
const targetRoot = path.join(root, "frontend");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(targetRoot).filter((f) => /\.(ts|tsx)$/.test(f));
let converted = 0;
let skipped = 0;
let failed = 0;
for (const file of files) {
  if (file.endsWith(".d.ts")) {
    fs.unlinkSync(file);
    skipped++;
    continue;
  }
  const code = fs.readFileSync(file, "utf8");
  try {
    const result = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        removeComments: false,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
      fileName: path.basename(file),
      reportDiagnostics: false,
    });
    const outPath = file.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js");
    fs.writeFileSync(outPath, result.outputText, "utf8");
    fs.unlinkSync(file);
    converted++;
  } catch (e) {
    failed++;
    console.error("Failed:", file);
    console.error(e && e.message ? e.message : e);
  }
}
console.log({ converted, skipped, failed, total: files.length });
