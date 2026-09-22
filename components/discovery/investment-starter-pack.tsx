'use client';

import { BookOpen, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { investmentStarterPrompts } from '@/lib/home/investment-starter-prompts';

interface InvestmentStarterPackProps {
  currentRequirement: string;
  researchAvailable: boolean;
  onSelect: (prompt: string) => void;
}

export function InvestmentStarterPack({
  currentRequirement,
  researchAvailable,
  onSelect,
}: InvestmentStarterPackProps) {
  const selectPrompt = (title: string, prompt: string) => {
    const current = currentRequirement.trim();
    if (current && current !== prompt) {
      const replace = window.confirm(
        `Replace your current classroom brief with the “${title}” starter?`,
      );
      if (!replace) return;
    }
    onSelect(prompt);
  };

  return (
    <section
      aria-labelledby="investment-starter-pack-title"
      className="mt-5 w-full rounded-2xl border border-border/60 bg-background/65 p-4 shadow-sm backdrop-blur"
      data-testid="investment-starter-pack"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" aria-hidden="true" />
            <h2 id="investment-starter-pack-title" className="text-lg font-semibold">
              Australian investment course briefs
            </h2>
          </div>
          <p className="mt-1 text-base leading-relaxed text-foreground">
            Choose a reviewable course brief, then tailor it before entering the classroom.
          </p>
        </div>
        <div className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-sm font-medium text-emerald-800 dark:text-emerald-200 sm:flex">
          <ShieldCheck className="size-3" aria-hidden="true" />
          General education
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {investmentStarterPrompts.map((starter) => (
          <button
            key={starter.id}
            type="button"
            data-testid={`investment-starter-${starter.id}`}
            onClick={() => selectPrompt(starter.title, starter.prompt)}
            className="group rounded-xl border border-border/60 bg-card/70 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <span className="block text-base font-semibold text-foreground">{starter.title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-foreground">
              {starter.summary}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">
        {researchAvailable
          ? 'Research is configured and will run for these briefs. Generation may use provider credit. Retrieved material still needs editorial review.'
          : 'AI generation for these briefs is blocked until Web Search is configured. No research service or API key is needed for the built-in reading lessons below.'}
      </p>
      <Link
        href="/learn"
        className="mt-3 inline-block rounded-lg border px-3 py-2 text-sm font-semibold underline focus-visible:outline focus-visible:outline-2"
      >
        Read the built-in lessons — no API key needed
      </Link>
    </section>
  );
}
