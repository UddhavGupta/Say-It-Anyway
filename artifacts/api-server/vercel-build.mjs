// Builds the whole app into Vercel's Build Output API format (.vercel/output):
//   - static/            -> the Vite SPA
//   - functions/api.func -> the Express API, bundled into one serverless function
//   - config.json        -> /api/* to the function, everything else to the SPA
// Vercel uses .vercel/output as-is when the build command produces it.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { build as esbuild } from "esbuild";

const apiDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(apiDir, "../..");
const out = path.join(root, ".vercel/output");
const funcDir = path.join(out, "functions/api.func");
const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit" });

await rm(out, { recursive: true, force: true });

// 1. Sync DB schema (idempotent). Skipped when DATABASE_URL is not set.
if (process.env.DATABASE_URL) {
  try {
    execSync("pnpm --filter @workspace/db run push", {
      cwd: root,
      stdio: ["ignore", "inherit", "inherit"],
      timeout: 90_000,
    });
  } catch (err) {
    console.warn("[vercel-build] drizzle push failed or timed out; continuing.", err.message);
  }
} else {
  console.warn("[vercel-build] DATABASE_URL not set; skipping schema push.");
}

// 2. Frontend
run("pnpm --filter @workspace/say-it-anyway run build");
await cp(path.join(root, "artifacts/say-it-anyway/dist/public"), path.join(out, "static"), {
  recursive: true,
});

// 3. API function
await mkdir(funcDir, { recursive: true });
await esbuild({
  entryPoints: [path.join(apiDir, "src/app.ts")],
  platform: "node",
  target: "node22",
  bundle: true,
  format: "esm",
  outfile: path.join(funcDir, "index.mjs"),
  external: ["pg-native", "pino-pretty"],
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
  banner: {
    js: `import { createRequire as __cr } from 'node:module';
import __p from 'node:path'; import __u from 'node:url';
globalThis.require = __cr(import.meta.url);
globalThis.__filename = __u.fileURLToPath(import.meta.url);
globalThis.__dirname = __p.dirname(globalThis.__filename);`,
  },
});
await writeFile(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify(
    { runtime: "nodejs22.x", handler: "index.mjs", launcherType: "Nodejs", shouldAddHelpers: false },
    null,
    2,
  ),
);
await writeFile(path.join(funcDir, "package.json"), JSON.stringify({ type: "module" }));

// 4. Routing
await writeFile(
  path.join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: "^/api(?:/.*)?$", dest: "/api" },
        {
          src: "^/assets/(.*)$",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          continue: true,
        },
        { handle: "filesystem" },
        { src: "/.*", dest: "/index.html" },
      ],
    },
    null,
    2,
  ),
);

console.log("[vercel-build] wrote", out);
