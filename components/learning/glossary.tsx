import { investmentGlossary } from '@/lib/learning/applied-learning';

export function Glossary() {
  return (
    <section
      id="glossary"
      className="rounded-xl border bg-card p-5"
      aria-labelledby="glossary-title"
    >
      <h2 id="glossary-title" className="text-2xl font-semibold">
        Plain-language glossary
      </h2>
      <dl className="mt-4 space-y-4">
        {investmentGlossary.map(({ term, meaning }) => (
          <div key={term}>
            <dt className="font-semibold">{term}</dt>
            <dd className="mt-1">{meaning}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
