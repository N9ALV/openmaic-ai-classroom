import { access, cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '.next', 'standalone');
await access(path.join(output, 'server.js'));

// Runtime credentials must be injected by the operator, not shipped in a build.
// Fail rather than silently deleting unknown material from the artefact.
async function checkForLocalConfig(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const name = entry.name.toLowerCase();
    if (
      (name === '.env' || name.startsWith('.env.') || /^server-providers.*\.ya?ml$/.test(name)) &&
      !name.includes('example')
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
await cp(path.join(root, 'public'), path.join(output, 'public'), { recursive: true });
await cp(path.join(root, '.next', 'static'), path.join(output, '.next', 'static'), {
  recursive: true,
});
console.log(
  'Standalone public and static assets prepared. Supply private provider settings at runtime; do not copy .env.local into the artefact.',
);
