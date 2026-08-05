const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const blocked = [/Ã./, /Â/, /â€™/, /â€œ/, /â€\u009d/, /â€\u0093/, /�/];
const roots = ["apps", "docs", "packages"];
const exts = new Set([".ts", ".tsx", ".js", ".cjs", ".json", ".html", ".css", ".md", ".txt", ".prisma"]);
const ignore = new Set(["node_modules", "dist", ".git"]);
const findings = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(file);
      continue;
    }
    if (!exts.has(path.extname(entry.name))) continue;
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (blocked.some((pattern) => pattern.test(line))) {
        findings.push(`${path.relative(root, file)}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

roots.forEach((dir) => walk(path.join(root, dir)));
if (findings.length) {
  console.error("Caractères parasites détectés:");
  findings.forEach((line) => console.error(line));
  process.exit(1);
}
console.log("Aucun caractère parasite détecté.");

