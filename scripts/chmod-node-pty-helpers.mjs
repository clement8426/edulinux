#!/usr/bin/env node
/**
 * Rend exécutable tous les spawn-helper de node-pty (darwin-arm64, darwin-x64, linux…).
 * Sans ça, sur Mac Apple Silicon : erreur « posix_spawnp failed ».
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'node_modules', 'node-pty');

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const x of entries) {
    const full = path.join(dir, x.name);
    if (x.isDirectory()) walk(full);
    else if (x.name === 'spawn-helper') {
      try {
        fs.chmodSync(full, 0o755);
      } catch {
        /* ignore */
      }
    }
  }
}

walk(root);
