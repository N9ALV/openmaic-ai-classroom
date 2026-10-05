import { cp, lstat, mkdir, readdir, readlink, realpath, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function inside(directory, target) {
  const relative = path.relative(directory, target);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  );
}

/** Copy a prepared release without losing Windows directory-symlink types. */
export async function copyStandalone(source, destination) {
  source = await realpath(source);
  destination = path.resolve(destination);
  if (inside(source, destination) || inside(destination, source)) {
    throw new Error('Release source and destination must be separate directories.');
  }
  for (const name of [
    '.git',
    'data',
    'logs',
    'test-results',
    'coverage',
    'playwright-report',
    'blob-report',
  ]) {
    if (await lstat(path.join(source, name)).catch(() => undefined)) {
      throw new Error('Prepare a fresh standalone artefact before copying the release.');
    }
  }

  const links = [];
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const name = entry.name.toLowerCase();
      if (
        (name === '.env' || name.startsWith('.env.') || /^server-providers.*\.ya?ml$/.test(name)) &&
        !['.env.example', 'server-providers.example.yml', 'server-providers.example.yaml'].includes(
          name,
        )
      ) {
        throw new Error('Local provider configuration must not be copied into a release.');
      }
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        const target = await realpath(file);
        const stored = await readlink(file);
        if (!inside(source, target) || path.isAbsolute(stored)) {
          throw new Error('Prepare standalone dependency links before copying the release.');
        }
        links.push({ file, target, type: (await lstat(target)).isDirectory() ? 'dir' : 'file' });
      } else if (entry.isDirectory()) {
        await inspect(file);
      }
    }
  }
  await inspect(source);
  // Never overwrite an existing release or its runtime learner state.
  await mkdir(destination);
  await cp(source, destination, {
    recursive: true,
    filter: async (file) => !(await lstat(file)).isSymbolicLink(),
  });
  for (const link of links) {
    const copied = path.join(destination, path.relative(source, link.file));
    const target = path.join(destination, path.relative(source, link.target));
    await symlink(path.relative(path.dirname(copied), target), copied, link.type);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) {
    console.error('Usage: node scripts/copy-standalone.mjs <new-release-directory>');
    process.exitCode = 1;
  } else {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    await copyStandalone(path.join(root, '.next', 'standalone'), process.argv[2]);
    console.log('Standalone release copied with portable dependency links.');
  }
}
