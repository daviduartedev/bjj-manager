import fs from "fs";
import path from "path";

export type IdorContextFile = {
  studentIdB: string | null;
  reason?: string | null;
};

export function readIdorContext(): IdorContextFile {
  const p = path.join(__dirname, "..", ".cache", "idor-context.json");
  try {
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw) as IdorContextFile;
  } catch {
    return { studentIdB: null, reason: "idor_cache_unreadable" };
  }
}
