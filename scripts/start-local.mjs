import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localUrl = 'http://localhost:3000';
const healthUrl = `${localUrl}/api/health`;

async function isHealthy() {
  try {
    const response = await fetch(healthUrl, { signal: AbortSignal.timeout(2_000) });
    return response.ok;
  } catch {
    return false;
  }
}

function openBrowser() {
  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/d', '/s', '/c', 'start', '', localUrl], {
      detached: true,
      stdio: 'ignore',
    }).unref();
    return;
  }

  const command = process.platform === 'darwin' ? 'open' : 'xdg-open';
  spawn(command, [localUrl], { detached: true, stdio: 'ignore' }).unref();
}

if (await isHealthy()) {
  console.log('OpenMAIC is already running. Opening the classroom...');
  openBrowser();
  process.exit(0);
}

console.log('Starting OpenMAIC. Keep this window open while using the classroom.');
console.log('The browser will open automatically when it is ready.');

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const server = spawn(command, ['dev', '--', '--port', '3000'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

let opened = false;
const readinessTimer = setInterval(async () => {
  if (opened || !(await isHealthy())) return;
  opened = true;
  clearInterval(readinessTimer);
  console.log(`OpenMAIC is ready at ${localUrl}`);
  openBrowser();
}, 1_000);

const stop = () => {
  clearInterval(readinessTimer);
  if (!server.killed) server.kill('SIGINT');
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);

server.once('error', (error) => {
  clearInterval(readinessTimer);
  console.error('OpenMAIC could not start:', error.message);
  process.exitCode = 1;
});

server.once('exit', (code) => {
  clearInterval(readinessTimer);
  process.exitCode = code ?? 0;
});
