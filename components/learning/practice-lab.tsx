'use client';

import { useState } from 'react';
import { audReturn, feeBalance, recoveryGain, withdrawalPath } from '@/lib/learning/calculations';

const format = (value: number) => value.toLocaleString('en-AU', { maximumFractionDigits: 2 });
function numeric(value: string) {
  if (!value.trim()) throw new Error('Fill in every value to calculate.');
  const result = Number(value);
  if (!Number.isFinite(result)) throw new Error('Use a finite number in each field.');
  return result;
}

type PracticeMode = 'drawdown' | 'fees' | 'currency' | 'sequence';
export function PracticeLab({ initialMode = 'drawdown' }: { initialMode?: PracticeMode }) {
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [values, setValues] = useState<Record<string, string>>({
    loss: '20',
    principal: '10000',
    gross: '5',
    feeA: '0.3',
    feeB: '1',
    years: '20',
    usd: '10',
    start: '0.65',
    end: '0.70',
    retirement: '100000',
    withdrawal: '10000',
    first: '-20',
    second: '25',
  });
  const field = (name: string, label: string, min: number, max: number, step: string = 'any') => (
    <label className="flex flex-col gap-1 text-sm" key={name}>
      {label}
      <input
        className="rounded-lg border bg-background p-2 text-base"
        type="number"
        min={min}
        max={max}
        step={step}
        value={values[name]}
        onChange={(event) => setValues({ ...values, [name]: event.target.value })}
      />
    </label>
  );
  let result: string;
  let invalid = false;
  let paths:
    | { first: ReturnType<typeof withdrawalPath>; reversed: ReturnType<typeof withdrawalPath> }
    | undefined;
  try {
    const n = (key: string) => numeric(values[key]);
    if (mode === 'drawdown') {
      const recovery = recoveryGain(n('loss'));
      result =
        recovery === null
          ? 'A complete loss leaves no capital to recover through investment returns.'
          : `Gain needed to recover: ${format(recovery)}%.`;
    } else if (mode === 'currency') {
      result = `AUD return before fees and tax: ${format(audReturn(n('usd'), n('start'), n('end')))}%.`;
    } else if (mode === 'sequence') {
      paths = {
        first: withdrawalPath(n('retirement'), [n('first'), n('second')], n('withdrawal')),
        reversed: withdrawalPath(n('retirement'), [n('second'), n('first')], n('withdrawal')),
      };
      result = `Final balance, entered order: A$${format(paths.first[1].balance)}. Reversed order: A$${format(paths.reversed[1].balance)}. Withdrawals occur after each year’s return.`;
      if ([...paths.first, ...paths.reversed].some((year) => year.shortfall > 0))
        result += ' At least one withdrawal could not be fully funded; see the shortfall below.';
    } else {
      const balanceA = feeBalance(n('principal'), n('gross'), n('feeA'), n('years'));
      const balanceB = feeBalance(n('principal'), n('gross'), n('feeB'), n('years'));
      result = `Final balance A: A$${format(balanceA)}. Balance B: A$${format(balanceB)}. A minus B: A$${format(balanceA - balanceB)}.`;
    }
  } catch (error) {
    invalid = true;
    result = error instanceof Error ? error.message : 'Check the values.';
  }

  return (
    <section
      aria-labelledby="practice-title"
      className="rounded-xl border bg-card p-5"
      id="practice-lab"
    >
      <h2 id="practice-title" className="text-xl font-semibold">
        Practice lab
      </h2>
      <p className="my-2 text-sm text-muted-foreground">
        Arithmetic only. All values are illustrative, not forecasts, recommendations or real market
        data. Nothing is sent to an AI provider.
      </p>
      <label className="my-4 block text-sm">
        Exercise
        <select
          className="ml-3 rounded border bg-background p-2"
          value={mode}
          onChange={(event) => setMode(event.target.value as typeof mode)}
        >
          <option value="drawdown">Loss and recovery</option>
          <option value="fees">Fee comparison</option>
          <option value="currency">USD to AUD return</option>
          <option value="sequence">Retirement withdrawal sequence</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        {mode === 'drawdown' && field('loss', 'Loss (%)', 0, 100)}
        {mode === 'currency' && (
          <>
            {field('usd', 'USD asset return (%)', -100, 100)}
            {field('start', 'Starting USD per AUD', 0.01, 10)}
            {field('end', 'Ending USD per AUD', 0.01, 10)}
          </>
        )}
        {mode === 'fees' && (
          <>
            {field('principal', 'Starting balance (AUD)', 0, 100_000_000)}
            {field('gross', 'Illustrative gross return (% a year)', -100, 100)}
            {field('years', 'Years', 0, 60, '1')}
            {field('feeA', 'Annual fee A (%)', 0, 50)}
            {field('feeB', 'Annual fee B (%)', 0, 50)}
          </>
        )}
        {mode === 'sequence' && (
          <>
            {field('retirement', 'Retirement example starting balance (AUD)', 0, 100_000_000)}
            {field('withdrawal', 'Year-end withdrawal (AUD)', 0, 100_000_000)}
            {field('first', 'First annual return (%)', -100, 100)}
            {field('second', 'Second annual return (%)', -100, 100)}
          </>
        )}
      </div>
      <output
        aria-live="polite"
        aria-atomic="true"
        className={`mt-4 block rounded-lg p-3 font-medium ${invalid ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}
      >
        {result}
      </output>
      {paths && !invalid && (
        <div className="mt-4 space-y-4">
          <p>
            The same returns in a different order. Bar lengths show the final balances; they do not
            show probabilities.
          </p>
          {(['first', 'reversed'] as const).map((key) => (
            <div key={key}>
              <p className="font-medium">
                {key === 'first' ? 'Entered order' : 'Reversed order'}: A$
                {format(paths![key][1].balance)}
              </p>
              <div aria-hidden="true" className="mt-1 h-5 rounded bg-muted">
                <div
                  className="h-5 rounded bg-blue-700"
                  style={{
                    width: `${(100 * paths![key][1].balance) / Math.max(1, paths!.first[1].balance, paths!.reversed[1].balance)}%`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="mb-2 text-left font-semibold">
                Year-end balances and unmet withdrawals (AUD)
              </caption>
              <thead>
                <tr>
                  <th className="border p-2 text-left">Path / year</th>
                  <th className="border p-2 text-right">Balance</th>
                  <th className="border p-2 text-right">Shortfall</th>
                </tr>
              </thead>
              <tbody>
                {(['first', 'reversed'] as const).flatMap((key) =>
                  paths![key].map((year, index) => (
                    <tr key={`${key}-${index}`}>
                      <th className="border p-2 text-left font-normal" scope="row">
                        {key === 'first' ? 'Entered' : 'Reversed'} / {index + 1}
                      </th>
                      <td className="border p-2 text-right">{format(year.balance)}</td>
                      <td className="border p-2 text-right">{format(year.shortfall)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="mt-3 text-sm text-muted-foreground">
        {mode === 'sequence'
          ? 'Two-year arithmetic illustration, not a retirement forecast. Each return applies before that year’s withdrawal. No tax, fees, inflation or borrowing; balances stop at zero and any unmet withdrawal is shown as a shortfall.'
          : mode === 'fees'
            ? 'Model: starting balance × [(1 + gross return) × (1 − fee)]^years. A constant return, yearly end-value fees, no contributions, withdrawals, inflation or tax. Actual fee schedules differ.'
            : mode === 'currency'
              ? 'Model: (1 + USD asset return) × (starting USD per AUD ÷ ending USD per AUD) − 1. Unhedged, with no fees or tax. Percentages are converted to fractions for calculation.'
              : 'Model: required recovery = loss ÷ (1 − loss). Loss and recovery use different capital bases. This is not the probability or timing of recovery.'}
      </p>
    </section>
  );
}
