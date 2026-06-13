import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = join(__dirname, 'commands');

export async function loadCommands() {
  const commands = new Map();

  for (const file of walk(COMMANDS_DIR)) {
    const mod = await import(pathToFileURL(file).href);
    if (!mod?.data?.name || typeof mod.execute !== 'function') {
      console.warn(`[loadCommands] Skipping ${file}: missing "data" or "execute" export.`);
      continue;
    }
    commands.set(mod.data.name, mod);
  }

  return commands;
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      yield full;
    }
  }
}
