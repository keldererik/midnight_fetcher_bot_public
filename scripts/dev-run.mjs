#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

function run(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  child.on('exit', code => process.exit(code ?? 0));
}

const isWindows = process.platform === 'win32';
const repoRoot = process.cwd();

if (isWindows) {
  const winScript = join(repoRoot, 'run.cmd');
  if (!existsSync(winScript)) {
    console.error('run.cmd not found. Please pull the repository again.');
    process.exit(1);
  }
  run('cmd.exe', ['/c', winScript]);
} else {
  const macScript = join(repoRoot, 'run.sh');
  if (!existsSync(macScript)) {
    console.error('run.sh not found. Creating a minimal one for you...');
    console.error('Please re-run after committing run.sh or pull latest.');
    process.exit(1);
  }
  run('bash', [macScript]);
}


