#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`Command failed: ${cmd} ${args.join(' ')}`))));
  });
}

const isWindows = process.platform === 'win32';
const repoRoot = process.cwd();
const hashengineDir = join(repoRoot, 'hashengine');

async function main() {
  try {
    if (isWindows) {
      const script = join(hashengineDir, 'build.cmd');
      if (!existsSync(script)) throw new Error('hashengine/build.cmd not found');
      await run('cmd.exe', ['/c', script, ...process.argv.slice(2)]);
    } else {
      const script = join(hashengineDir, 'build.sh');
      if (!existsSync(script)) throw new Error('hashengine/build.sh not found');
      await run('bash', [script, ...process.argv.slice(2)]);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();


