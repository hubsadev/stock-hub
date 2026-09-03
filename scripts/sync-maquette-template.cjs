const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const sourcePath = path.join(root, "maquettes", "20-stock-hub-mvp", "index.html");
const webSrc = path.join(root, "apps", "web", "src");
const partsDir = path.join(webSrc, "template-parts");
const componentsDir = path.join(webSrc, "components");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) fail(`Maquette introuvable: ${sourcePath}`);
fs.mkdirSync(partsDir, { recursive: true });
fs.mkdirSync(componentsDir, { recursive: true });

const source = fs.readFileSync(sourcePath, "utf8");
const headEnd = source.indexOf("</head>");
if (headEnd === -1) fail("Balise </head> introuvable dans la maquette.");
const head = source.slice(0, headEnd);
const styleMatch = head.match(/<style>([\s\S]*?)<\/style>/i);
if (!styleMatch) fail("Style principal introuvable dans la maquette.");
let css = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');\n${styleMatch[1].trim()}\n.template-part { display: contents; }\n#root { display: contents; }\n`;
css = css.replace("button { font-family: inherit; cursor: pointer; }", "button { font-family: inherit; cursor: pointer; border: 0; background: transparent; padding: 0; color: inherit; }");
fs.writeFileSync(path.join(webSrc, "template.css"), css, "utf8");

const bodyMatch = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) fail("Body introuvable dans la maquette.");
let html = bodyMatch[1].replace(/<script>[\s\S]*?<\/script>\s*$/i, "").trim();
html = html.replace(/onclick="([^"]+)"/g, 'data-action="$1"');

const asideStart = html.indexOf("<aside");
const asideEnd = html.indexOf("</aside>", asideStart) + "</aside>".length;
const mainStart = html.indexOf("<main", asideEnd);
const mainEnd = html.indexOf("</main>", mainStart) + "</main>".length;
if (asideStart < 0 || asideEnd < 0 || mainStart < 0 || mainEnd < 0) fail("Découpage template impossible.");

const login = html.slice(0, asideStart).trim();
const sidebar = html.slice(asideStart, asideEnd).trim();
const workspace = html.slice(mainStart, mainEnd).trim();
const modals = html.slice(mainEnd).trim();

fs.writeFileSync(path.join(partsDir, "login.html"), `${login}\n`, "utf8");
fs.writeFileSync(path.join(partsDir, "sidebar.html"), `${sidebar}\n`, "utf8");
fs.writeFileSync(path.join(partsDir, "workspace.html"), `${workspace}\n`, "utf8");
fs.writeFileSync(path.join(partsDir, "modals.html"), `${modals}\n`, "utf8");

const shellPath = path.join(componentsDir, "StockHubShell.tsx");
if (!fs.existsSync(shellPath)) {
  fs.writeFileSync(shellPath, `import loginHtml from "../template-parts/login.html?raw";\nimport sidebarHtml from "../template-parts/sidebar.html?raw";\nimport workspaceHtml from "../template-parts/workspace.html?raw";\nimport modalsHtml from "../template-parts/modals.html?raw";\n\nfunction HtmlPart({ html }: { html: string }) {\n  return <div className="template-part" dangerouslySetInnerHTML={{ __html: html }} />;\n}\n\nexport function StockHubShell() {\n  return (\n    <>\n      <HtmlPart html={loginHtml} />\n      <HtmlPart html={sidebarHtml} />\n      <HtmlPart html={workspaceHtml} />\n      <HtmlPart html={modalsHtml} />\n    </>\n  );\n}\n`, "utf8");
}

console.log("Maquette 20 synchronisée vers apps/web/src.");


