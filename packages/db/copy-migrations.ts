#!/usr/bin/env bun
import { cpSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the app name from environment variable or command line argument
const appName = process.env.APP_NAME || process.argv[2];

if (!appName) {
  console.error(
    "❌ Error: APP_NAME environment variable or app name argument is required"
  );
  console.error("Usage: bun run copy-migrations.ts <app-name>");
  console.error("   or: APP_NAME=<app-name> bun run copy-migrations.ts");
  process.exit(1);
}

const sourceDir = join(__dirname, "drizzle");
const targetDir = join(__dirname, "..", "..", "apps", appName, "migrations");

// Check if source directory exists
if (!existsSync(sourceDir)) {
  console.error(`❌ Error: Source directory not found: ${sourceDir}`);
  process.exit(1);
}

// Check if app directory exists
const appDir = join(__dirname, "..", "..", "apps", appName);
if (!existsSync(appDir)) {
  console.error(`❌ Error: App directory not found: ${appDir}`);
  console.error(`   Looking for: ${appDir}`);
  process.exit(1);
}

// Create target directory if it doesn't exist
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
  console.log(`✅ Created directory: ${targetDir}`);
}

// Copy all files from source to target
try {
  cpSync(sourceDir, targetDir, { recursive: true });

  // Count the files copied
  const countFiles = (dir: string): number => {
    let count = 0;
    const files = readdirSync(dir);
    for (const file of files) {
      const fullPath = join(dir, file);
      if (statSync(fullPath).isDirectory()) {
        count += countFiles(fullPath);
      } else {
        count++;
      }
    }
    return count;
  };

  const fileCount = countFiles(targetDir);

  console.log(`✅ Successfully copied migrations to ${appName}`);
  console.log(`   Source: ${sourceDir}`);
  console.log(`   Target: ${targetDir}`);
  console.log(`   Files: ${fileCount}`);
} catch (error) {
  console.error(`❌ Error copying migrations:`, error);
  process.exit(1);
}

