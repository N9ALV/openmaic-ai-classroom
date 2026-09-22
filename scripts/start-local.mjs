import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOCAL_URL = 'http://localhost:3000'; // Preserve the original browser-storage origin.
export const PROBE_URL = 'http://127.0.0.1:3000/api/health';
export const START_TIMEOUT_MS = 180_000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function isOpenMAICHealth(body) {
  return body?.service === 'openmaic' && body?.success === true && body?.status === 'ok';
}

export async function probe(fetchImpl = fetch) {
  try {
    const response = await fetchImpl(PROBE_URL, {
      signal: AbortSignal.timeout(2_000),
      redirect: 'error',
    });
    return response.ok && isOpenMAICHealth(await response.json());
  } catch {
    return false;
  }
}

export function nextArguments(cli) {
  // Direct Node invocation avoids the pnpm/cmd intermediate process and the
  // stray `--` that Next interpreted as a project directory in the old launcher.
  // Never bind server-managed provider keys to the LAN by default.
  return [cli, 'dev', '--hostname', '127.0.0.1', '--port', '3000'];
}

async function portIsFree() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error) => (error.code === 'EADDRINUSE' ? resolve(false) : reject(error)));
    server.listen({ host: '127.0.0.1', port: 3000, exclusive: true }, () =>
      server.close(() => resolve(true)),
    );
  });
}

export async function waitUntilReady({
  check = probe,
  delay = sleep,
  now = Date.now,
  alive = () => true,
  timeout = START_TIMEOUT_MS,
} = {}) {
  const deadline = now() + timeout;
  while (alive() && now() < deadline) {
    if (await check()) return alive();
    await delay(1_000);
  }
  return false;
}

export function openBrowser() {
  const [command, args] =
    process.platform === 'win32'
      ? ['rundll32.exe', ['url.dll,FileProtocolHandler', LOCAL_URL]]
      : [process.platform === 'darwin' ? 'open' : 'xdg-open', [LOCAL_URL]];
  const opener = spawn(command, args, { detached: true, stdio: 'ignore' });
  opener.on('error', () => console.log(`Open your browser at ${LOCAL_URL}`));
  opener.unref();
}

export async function main() {
  if (await probe()) {
    console.log('OpenMAIC is already running. Reusing it; no extra server started.');
    openBrowser();
    return;
  }
  if (!(await portIsFree())) {
    throw new Error(
      'Port 3000 is occupied or an existing classroom is still starting. No second server was launched. Keep the existing window open and try again when it is ready.',
    );
  }
  for (const filename of [
    'packages/@openmaic/storage/dist/asset/collector.js',
    'public/vendor/maic-importer/index.js',
  ]) {
    await access(path.join(rootDir, filename)).catch(() => {
      throw new Error(
        'Installation is incomplete. Run pnpm install --frozen-lockfile in the OpenMAIC folder, then try again.',
      );
    });
  }
  const cli = createRequire(import.meta.url).resolve('next/dist/bin/next');
  console.log('Starting the local-only classroom. Keep this one window open.');
  console.log('Opening the browser will not generate lessons or incur model charges.');
  const child = spawn(process.execPath, nextArguments(cli), {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  });
  let alive = true;
  let stopping = false;
  const stop = () => {
    if (!alive || stopping) return;
    stopping = true;
    if (process.platform === 'win32' && child.pid) {
      // Only the process tree created above; never kill all Node processes.
      const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
      killer.on('error', () => child.kill());
    } else child.kill('SIGTERM');
  };
  const handlers = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  for (const signal of handlers) process.once(signal, stop);
  const exited = new Promise((resolve) => {
    child.once('error', () => {
      alive = false;
      resolve(1);
    });
    child.once('exit', (code) => {
      alive = false;
      resolve(stopping ? 0 : (code ?? 1));
    });
  });
  if (await waitUntilReady({ alive: () => alive && !stopping })) openBrowser();
  else if (alive && !stopping) {
    console.error(
      'The classroom did not become ready within three minutes. Stopping this startup attempt.',
    );
    stop();
    process.exitCode = 1;
  }
  const code = await exited;
  process.exitCode ||= code;
  for (const signal of handlers) process.removeListener(signal, stop);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
