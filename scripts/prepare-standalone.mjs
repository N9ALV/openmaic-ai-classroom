import { access, cp, lstat, readdir, realpath, rm, symlink, unlink } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = await realpath(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const output = path.join(root, '.next', 'standalone');
await access(path.join(output, 'server.js'));

const developmentDirectories = new Set([
  '.git',
  'logs',
  'data',
  'test-results',
  'playwright-report',
  'blob-report',
  'coverage',
]);

// Runtime credentials must be injected by the operator, not shipped in a build.
// Unknown credentials fail closed, including those under public/.
async function checkForLocalConfig(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const name = entry.name.toLowerCase();
    if (
      (name === '.env' || name.startsWith('.env.') || /^server-providers.*\.ya?ml$/.test(name)) &&
      !['.env.example', 'server-providers.example.yml', 'server-providers.example.yaml'].includes(
        name,
      )
    ) {
      throw new Error(
        'Local provider configuration was found in the standalone artefact. Stop and rebuild without bundled secrets.',
      );
    }
    if (entry.isDirectory()) await checkForLocalConfig(path.join(directory, entry.name));
  }
}
await checkForLocalConfig(output);
await checkForLocalConfig(path.join(root, 'public'));

// Some Next.js instrumentation traces bypass route tracing exclusions. Remove
// only these explicitly forbidden roots from the generated artefact. The
// original worktree's data/logs/storage are never targets of this operation.
// Refuse links or redirected build paths before any recursive removal.
if ((await realpath(output)).toLowerCase() !== output.toLowerCase()) {
  throw new Error('Standalone output must be an ordinary directory inside this worktree.');
}

async function digest(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

// A served standalone directory may contain new learner state. Only remove
// byte-identical build copies of files that still exist in the worktree.
async function assertBuildCopy(candidate, original) {
  const copied = await lstat(candidate);
  const source = await lstat(original).catch(() => undefined);
  if (!source || copied.isSymbolicLink() || source.isSymbolicLink()) {
    throw new Error(
      'Unknown standalone state; preserve runtime data and rebuild into a fresh directory.',
    );
  }
  if (copied.isDirectory() && source.isDirectory()) {
    for (const entry of await readdir(candidate)) {
      await assertBuildCopy(path.join(candidate, entry), path.join(original, entry));
    }
  } else if (
    !copied.isFile() ||
    !source.isFile() ||
    copied.size !== source.size ||
    (await digest(candidate)) !== (await digest(original))
  ) {
    throw new Error(
      'Standalone state differs from the worktree; preserve runtime data and rebuild into a fresh directory.',
    );
  }
}

const excludedCopies = [];
for (const name of developmentDirectories) {
  const candidate = path.resolve(output, name);
  if (path.dirname(candidate) !== output) throw new Error('Invalid standalone exclusion path.');
  const entry = await lstat(candidate).catch((error) => {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  });
  if (!entry) continue;
  if (!entry.isDirectory() || entry.isSymbolicLink()) {
    throw new Error('Standalone state exclusions must be ordinary directories.');
  }
  if ((await realpath(candidate)).toLowerCase() !== candidate.toLowerCase()) {
    throw new Error('Standalone state exclusion points outside the generated artefact.');
  }
  await assertBuildCopy(candidate, path.join(root, name));
  excludedCopies.push(candidate);
}
// Validate every exclusion before deleting any of the generated copies.
for (const candidate of excludedCopies) await rm(candidate, { recursive: true });

// This transport is deliberately imported at runtime by the provider SDKs.
// It has no production dependencies, so copy its installed package explicitly
// instead of letting an untraced import borrow it from the developer checkout.
const require = createRequire(import.meta.url);
const transportDirectory = path.dirname(require.resolve('undici/package.json'));
const transportOutput = path.join(output, 'node_modules', 'undici');
const transportLink = await lstat(transportOutput).catch((error) => {
  if (error.code === 'ENOENT') return undefined;
  throw error;
});
if (transportLink?.isSymbolicLink()) await unlink(transportOutput);
await cp(await realpath(transportDirectory), transportOutput, {
  recursive: true,
});

function inside(directory, target) {
  const relative = path.relative(directory, target);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  );
}

// Next.js on Windows preserves absolute pnpm links back into the checkout.
// Convert only links whose corresponding traced target exists in this build;
// every result must remain inside the artefact when it is moved to another host.
async function makeLinksPortable(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const link = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      const target = await realpath(link);
      const portable = inside(output, target)
        ? target
        : path.join(output, path.relative(root, target));
      if (!inside(root, target) || !inside(output, portable)) {
        throw new Error('Standalone dependency link points outside the worktree or artefact.');
      }
      const traced = await lstat(portable).catch(() => undefined);
      if (!traced || traced.isSymbolicLink()) {
        throw new Error(
          'Standalone dependency link has no ordinary traced target. Rebuild before release.',
        );
      }
      await unlink(link);
      await symlink(
        path.relative(path.dirname(link), portable),
        link,
        traced.isDirectory() ? 'dir' : 'file',
      );
    } else if (entry.isDirectory()) {
      await makeLinksPortable(link);
    }
  }
}
await cp(path.join(root, 'public'), path.join(output, 'public'), { recursive: true });
await cp(path.join(root, '.next', 'static'), path.join(output, '.next', 'static'), {
  recursive: true,
});
await makeLinksPortable(output);
console.log(
  'Standalone public and static assets prepared. Supply private provider settings at runtime; do not copy .env.local into the artefact.',
);
