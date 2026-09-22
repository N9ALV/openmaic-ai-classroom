import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Summarise a Vitest JSON report without dumping successful-test logs or local
// provider configuration. Useful for reproducible release evidence.
const filename = process.argv[2];
if (!filename) throw new Error('Supply a Vitest JSON report path.');
const report = JSON.parse(await readFile(filename, 'utf8'));
console.log(
  JSON.stringify(
    {
      total: report.numTotalTests,
      passed: report.numPassedTests,
      failed: report.numFailedTests,
      skipped: report.numPendingTests,
      files: report.testResults.length,
    },
    null,
    2,
  ),
);
for (const file of report.testResults) {
  const failures = file.assertionResults.filter((test) => test.status === 'failed');
  if (file.status !== 'failed' && !failures.length) continue;
  console.log(`\n${path.relative(process.cwd(), file.name)} (${failures.length} failed)`);
  if (!failures.length)
    console.log(String(file.message || 'Suite did not complete').slice(0, 1500));
  for (const test of failures) {
    console.log(`- ${test.fullName} (${Math.round(test.duration || 0)}ms)`);
    for (const message of test.failureMessages) {
      console.log(
        message === 'Error: STACK_TRACE_ERROR' || message.startsWith('Error: STACK_TRACE_ERROR\n')
          ? '  Runner recorded STACK_TRACE_ERROR; rerun this file with the default reporter for the assertion.'
          : message.slice(0, 1500),
      );
    }
  }
}
