#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

const args = process.argv.slice(2);
const command = args[0];

async function runCommand(cmd: string, cwd?: string): Promise<void> {
  console.log(`Running: ${cmd}${cwd ? ` in ${cwd}` : ""}`);
  try {
    const cmdArray = cmd.split(" ");
    if (cwd) {
      await $`${cmdArray}`.cwd(cwd);
    } else {
      await $`${cmdArray}`;
    }
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    console.error(`Exit code: ${err.exitCode}`);
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

async function checkPackageInstalled(packageName: string): Promise<boolean> {
  try {
    const result = await $`bun list ${packageName}`.nothrow();
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

async function installPackage(packageName: string): Promise<void> {
  console.log(`Installing ${packageName}...`);
  await runCommand(`bun add -g ${packageName}`);
}

async function initFlow(): Promise<void> {
  console.log("🚀 Starting deployment initialization...");

  if (!(await checkPackageInstalled("vercel"))) {
    console.log("Vercel not found, installing...");
    await installPackage("vercel");
  } else {
    console.log("✅ Vercel is already installed");
  }

  if (!(await checkPackageInstalled("supabase"))) {
    console.log("Supabase not found, installing...");
    await installPackage("supabase");
  } else {
    console.log("✅ Supabase is already installed");
  }

  console.log("🔐 Running Vercel login...");
  await runCommand("vercel login");

  console.log("🔐 Running Supabase login...");
  const databaseDir = join(process.cwd(), "packages", "database");

  if (!existsSync(databaseDir)) {
    console.error("❌ packages/database directory not found!");
    process.exit(1);
  }

  await runCommand("supabase login", databaseDir);

  console.log("🔗 Linking to Supabase project...");
  await runCommand("supabase link", databaseDir);

  console.log("✅ Initialization complete!");
}

async function pushFlow(): Promise<void> {
  console.log("🚀 Starting deployment...");

  const databaseDir = join(process.cwd(), "packages", "database");

  if (!existsSync(databaseDir)) {
    console.error("❌ packages/database directory not found!");
    process.exit(1);
  }

  console.log("📦 Pushing database changes...");
  await runCommand("supabase db push", databaseDir);

  console.log("🌐 Deploying to Vercel...");
  await runCommand("vercel --prod");

  console.log("✅ Deployment complete!");
}

function showHelp(): void {
  console.log(`
Usage: bun scripts/deploy.ts <command>

Commands:
  init    Initialize deployment tools (install vercel/supabase, run login, link project)
  push    Deploy to production (supabase db push + vercel --prod)
  help    Show this help message

Examples:
  bun scripts/deploy.ts init
  bun scripts/deploy.ts push
  `);
}

async function main() {
  switch (command) {
    case "init":
      await initFlow();
      break;
    case "push":
      await pushFlow();
      break;
    case "help":
    case "--help":
    case "-h":
      showHelp();
      break;
    default:
      console.error('❌ Invalid command. Use "init" or "push"');
      showHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
