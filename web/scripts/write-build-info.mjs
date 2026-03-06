import fs from "node:fs";
import path from "node:path";

const buildTimeIso = new Date().toISOString();
const target = path.resolve(process.cwd(), "src", "buildInfo.ts");

const content = `export const BUILD_TIME_ISO = "${buildTimeIso}";\n`;
fs.writeFileSync(target, content, "utf8");
console.log(`Wrote build info: ${buildTimeIso}`);
