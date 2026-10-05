import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';
import { copyStandalone } from '../../scripts/copy-standalone.mjs';

const execute = promisify(execFile);
const fixtures: string[] = [];

afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((directory) => rm(directory, { recursive: true })));
});

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'openmaic-standalone-'));
  fixtures.push(root);
  const output = path.join(root, '.next', 'standalone');
  await mkdir(path.join(root, 'scripts'), { recursive: true });
  await mkdir(output, { recursive: true });
  await mkdir(path.join(root, 'public'), { recursive: true });
  await mkdir(path.join(root, '.next', 'static'), { recursive: true });
  await mkdir(path.join(root, 'node_modules', 'undici'), { recursive: true });
  await writeFile(
    path.join(root, 'node_modules', 'undici', 'package.json'),
    JSON.stringify({ name: 'undici', version: '0.0.0-test', main: 'index.js' }),
  );
  await writeFile(
    path.join(root, 'node_modules', 'undici', 'index.js'),
    'module.exports = "synthetic transport";',
  );
  await cp('scripts/prepare-standalone.mjs', path.join(root, 'scripts', 'prepare-standalone.mjs'));
  await writeFile(path.join(output, 'server.js'), '// synthetic server');
  await writeFile(path.join(root, 'public', 'lesson.txt'), 'public lesson');
  await writeFile(path.join(root, '.next', 'static', 'app.js'), '// static app');
  return {
    root,
    output,
    run: () => execute(process.execPath, [path.join(root, 'scripts', 'prepare-standalone.mjs')]),
  };
}

describe('standalone release packaging', () => {
  it('refuses to overwrite an existing release', async () => {
    const { root, output } = await fixture();
    const destination = path.join(root, 'existing-release');
    await mkdir(destination);
    await writeFile(path.join(destination, 'learner.json'), 'existing learner state');
    await expect(copyStandalone(output, destination)).rejects.toMatchObject({ code: 'EEXIST' });
    expect(await readFile(path.join(destination, 'learner.json'), 'utf8')).toBe(
      'existing learner state',
    );
  });

  it('refuses a dependency link outside the artefact', async () => {
    const { root, output } = await fixture();
    const source = path.join(root, 'external-dependency');
    await mkdir(source);
    await mkdir(path.join(output, 'node_modules'));
    await symlink(source, path.join(output, 'node_modules', 'external'), 'dir');
    await expect(copyStandalone(output, path.join(root, 'copied-release'))).rejects.toThrow(
      'dependency links',
    );
  });

  it('refuses runtime credentials when copying a release', async () => {
    const { root, output } = await fixture();
    await writeFile(path.join(output, '.env.local'), 'synthetic private configuration');
    await expect(copyStandalone(output, path.join(root, 'copied-release'))).rejects.toThrow(
      'Local provider configuration',
    );
  });

  it('relocates dependency links and includes the runtime transport in a moved artefact', async () => {
    const { root, output, run } = await fixture();
    const dependency = path.join('node_modules', '.pnpm', 'synthetic', 'node_modules', 'synthetic');
    const source = path.join(root, dependency);
    const traced = path.join(output, dependency);
    await mkdir(source, { recursive: true });
    await writeFile(path.join(source, 'index.js'), 'module.exports = "portable dependency";');
    await cp(source, traced, { recursive: true });
    const link = path.join(output, 'node_modules', 'synthetic');
    await symlink(source, link, 'dir');
    await symlink(
      path.join(root, 'node_modules', 'undici'),
      path.join(output, 'node_modules', 'undici'),
      'dir',
    );
    await run();
    const moved = path.join(root, 'moved-release');
    await copyStandalone(output, moved);
    const result = await execute(
      process.execPath,
      ['-e', 'console.log(require("./node_modules/synthetic"), require("undici"))'],
      { cwd: moved },
    );
    expect(result.stdout.trim()).toBe('portable dependency synthetic transport');
  });

  it.each(['new', 'changed'])(
    'preserves %s runtime learner state and refuses preparation',
    async (kind) => {
      const { root, output, run } = await fixture();
      await mkdir(path.join(root, 'data'));
      await mkdir(path.join(output, 'data'));
      if (kind === 'changed')
        await writeFile(path.join(root, 'data', 'learner.json'), 'old synthetic state');
      await writeFile(path.join(output, 'data', 'learner.json'), 'new synthetic learner state');
      await expect(run()).rejects.toMatchObject({
        stderr: expect.stringContaining('preserve runtime data'),
      });
      expect(await readFile(path.join(output, 'data', 'learner.json'), 'utf8')).toBe(
        'new synthetic learner state',
      );
    },
  );

  it('excludes generated private state while preserving the original learner files', async () => {
    const { root, output, run } = await fixture();
    for (const name of ['data', 'logs', '.git', 'test-results', 'coverage']) {
      await mkdir(path.join(root, name), { recursive: true });
      await writeFile(path.join(root, name, 'marker.txt'), 'original state');
      await cp(path.join(root, name), path.join(output, name), { recursive: true });
    }
    await run();
    for (const name of ['data', 'logs', '.git', 'test-results', 'coverage']) {
      expect(await readFile(path.join(root, name, 'marker.txt'), 'utf8')).toBe('original state');
      await expect(readFile(path.join(output, name, 'marker.txt'))).rejects.toMatchObject({
        code: 'ENOENT',
      });
    }
    expect(await readFile(path.join(output, 'public', 'lesson.txt'), 'utf8')).toBe('public lesson');
    expect(await readFile(path.join(output, '.next', 'static', 'app.js'), 'utf8')).toBe(
      '// static app',
    );
  });

  it.each(['.env.local', '.env.example.local', 'server-providers.yaml'])(
    'refuses bundled credentials in %s',
    async (name) => {
      const { output, run } = await fixture();
      await writeFile(path.join(output, name), 'synthetic private configuration');
      await expect(run()).rejects.toMatchObject({
        stderr: expect.stringContaining('Local provider configuration'),
      });
      expect(await readFile(path.join(output, name), 'utf8')).toBe(
        'synthetic private configuration',
      );
    },
  );

  it('refuses credentials under public before copying them', async () => {
    const { root, output, run } = await fixture();
    await writeFile(path.join(root, 'public', '.env.local'), 'synthetic private configuration');
    await expect(run()).rejects.toMatchObject({
      stderr: expect.stringContaining('Local provider configuration'),
    });
    await expect(readFile(path.join(output, 'public', '.env.local'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it('refuses a state directory link and preserves its source', async () => {
    const { root, output, run } = await fixture();
    const source = path.join(root, 'learner-owned');
    await mkdir(source);
    await writeFile(path.join(source, 'marker.txt'), 'original learner state');
    await symlink(
      source,
      path.join(output, 'data'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    await expect(run()).rejects.toMatchObject({
      stderr: expect.stringContaining('ordinary directories'),
    });
    expect(await readFile(path.join(source, 'marker.txt'), 'utf8')).toBe('original learner state');
  });
});
