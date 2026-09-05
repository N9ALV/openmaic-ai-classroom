'use client';

import { BookOpen, ShieldCheck } from 'lucide-react';

import { investmentStarterPrompts } from '@/lib/home/investment-starter-prompts';

interface InvestmentStarterPackProps {
  currentRequirement: string;
  onSelect: (prompt: string) => void;
}

export function InvestmentStarterPack({
  currentRequirement,
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
            <h2 id="investment-starter-pack-title" className="text-sm font-semibold">
              Australian investment learning starters
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Choose a reviewable course brief, then tailor it before entering the classroom.
          </p>
        </div>
        <div className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 sm:flex">
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
            <span className="block text-xs font-semibold text-foreground group-hover:text-primary">
              {starter.title}
            </span>
            <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
              {starter.summary}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/80">
        Built-in prompts favour primary Australian sources, dated claims, downside analysis and
        explicit uncertainty. AI output still requires review before use or publication.
      </p>
    </section>
  );
}
