import { INVESTMENT_RESEARCH_MARKER } from './investment-research';

export interface InvestmentStarterPrompt {
  id: string;
  title: string;
  summary: string;
  prompt: string;
  sources: readonly string[];
}

const OFFICIAL_AUSTRALIAN_SOURCES = [
  'https://moneysmart.gov.au/',
  'https://www.ato.gov.au/',
  'https://www.rba.gov.au/',
  'https://www.asx.com.au/',
] as const;

const COMMON_COURSE_REQUIREMENTS = `

Course requirements:
- Write in Australian English. These are editorial drafts, not approved lessons.
- Cite only material actually retrieved or supplied. A suggested URL is not evidence that you accessed it. Do not invent quotations, source dates or verified claims.
- This is general educational content, not personal financial advice. Do not recommend a specific security, fund, broker or strategy as suitable for the learner.
- Start with learning objectives and assumptions, then build 8–12 concise scenes with at least one worked example, one interactive activity and a final knowledge check.
- Explain the realistic alternative, including doing nothing or using a simpler diversified approach.
- Evaluate fees, spreads, tax, liquidity, implementation burden, time horizon and opportunity cost where relevant.
- Explain AUD/USD currency exposure whenever an offshore asset or return is discussed.
- Show downside scenarios, drawdowns and failure modes rather than focusing only on headline returns.
- Separate sourced facts, assumptions and hypothetical examples. Date every time-sensitive claim.
- Prefer current primary Australian sources such as ASIC Moneysmart, the ATO, RBA and ASX. Use the supplied IU links as supporting education, attribute them and do not copy substantial text.
- State what evidence would change the conclusion. End with a source list and a verification checklist.
- Never promise returns. Clearly label all numbers that are illustrative.`;

function buildPrompt(
  topic: string,
  learningGoals: readonly string[],
  iuSources: readonly string[],
): string {
  const goals = learningGoals.map((goal) => `- ${goal}`).join('\n');
  const sources = [...OFFICIAL_AUSTRALIAN_SOURCES, ...iuSources]
    .map((source) => `- ${source}`)
    .join('\n');

  return `${INVESTMENT_RESEARCH_MARKER}
Create an Australian investment-education classroom titled “${topic}”.

Learning goals:
${goals}${COMMON_COURSE_REQUIREMENTS}

Starting sources to verify and cite:
${sources}`;
}

export const investmentStarterPrompts: readonly InvestmentStarterPrompt[] = [
  {
    id: 'asx-investing-foundations',
    title: 'ASX investing foundations',
    summary: 'Shares, ETFs, LICs, REITs and cash—what each one actually does.',
    sources: [
      'https://iu.com.au/key-insights-from-ben-felix-on-market-efficiency-crypto-and-academic-investing-research/',
    ],
    prompt: buildPrompt(
      'ASX Investing Foundations',
      [
        'Compare Australian shares, broad-market ETFs, LICs, REITs and cash without declaring a universal winner.',
        'Explain ownership, income, capital growth, fees, liquidity, concentration and tax considerations.',
        'Build a hypothetical A$10,000 portfolio activity that makes trade-offs visible without presenting it as a recommendation.',
      ],
      [
        'https://iu.com.au/key-insights-from-ben-felix-on-market-efficiency-crypto-and-academic-investing-research/',
      ],
    ),
  },
  {
    id: 'diversification-beyond-holdings',
    title: 'Diversification that actually works',
    summary: 'Look through holdings to sectors, factors, currencies and shared risks.',
    sources: [
      'https://iu.com.au/idiosyncratic-systematic-systemic-risk-the-crucial-distinctions/',
      'https://iu.com.au/equal-weight-etfs-vs-market-capitalisation-index-funds-the-real-trade-offs/',
    ],
    prompt: buildPrompt(
      'Diversification Beyond the Number of Holdings',
      [
        'Distinguish idiosyncratic, systematic and systemic risk using Australian examples.',
        'Show why holding count alone does not prove diversification.',
        'Compare market-cap and equal-weight portfolios, including factor tilts, turnover and implementation costs.',
        'Include an interactive risk-map activity covering sectors, geography, currency and counterparties.',
      ],
      [
        'https://iu.com.au/idiosyncratic-systematic-systemic-risk-the-crucial-distinctions/',
        'https://iu.com.au/equal-weight-etfs-vs-market-capitalisation-index-funds-the-real-trade-offs/',
      ],
    ),
  },
  {
    id: 'retirement-sequence-risk',
    title: 'Retirement income and sequence risk',
    summary: 'Why the order of returns matters once withdrawals begin.',
    sources: [
      'https://iu.com.au/drawdown/',
      'https://iu.com.au/paul-tudor-jones-on-risk-buffett-ai-and-the-difference-between-trading-and-investing/',
    ],
    prompt: buildPrompt(
      'Retirement Income, Drawdowns and Sequence Risk',
      [
        'Explain risk capacity, risk tolerance and objective-required risk, using the most restrictive genuine constraint.',
        'Demonstrate sequence-of-returns risk with two hypothetical retirees receiving the same average return in a different order.',
        'Compare cash buffers, diversified income, rebalancing and spending flexibility without prescribing a personal strategy.',
        'Include a stress test for inflation, a prolonged equity drawdown and unexpected spending.',
      ],
      [
        'https://iu.com.au/drawdown/',
        'https://iu.com.au/paul-tudor-jones-on-risk-buffett-ai-and-the-difference-between-trading-and-investing/',
      ],
    ),
  },
  {
    id: 'aud-usd-investing',
    title: 'USD investments for Australians',
    summary: 'Separate the investment decision from the AUD/USD currency decision.',
    sources: [
      'https://iu.com.au/michael-green-on-passive-investing-long-bonds-and-why-treasury-signals-may-be-misleading/',
      'https://iu.com.au/calculate-your-trade-quantity-australian-us-dollar-based-percentage-risk/',
    ],
    prompt: buildPrompt(
      'USD Investments for Australian Investors',
      [
        'Explain how an asset return and the AUD/USD movement combine into an Australian-dollar result.',
        'Compare hedged and unhedged exposure, including costs, tracking differences and imperfect hedges.',
        'Work through a transparent hypothetical example with fees, spreads and currency conversion.',
        'Distinguish currency diversification from a directional currency bet.',
      ],
      [
        'https://iu.com.au/michael-green-on-passive-investing-long-bonds-and-why-treasury-signals-may-be-misleading/',
        'https://iu.com.au/calculate-your-trade-quantity-australian-us-dollar-based-percentage-risk/',
      ],
    ),
  },
  {
    id: 'risk-sizing-and-leverage',
    title: 'Risk, sizing and leverage',
    summary: 'Position size is part of the decision—not an afterthought.',
    sources: [
      'https://iu.com.au/calculate-your-trade-quantity-australian-us-dollar-based-percentage-risk/',
      'https://iu.com.au/drawdown/',
    ],
    prompt: buildPrompt(
      'Position Sizing, Drawdowns and Leverage',
      [
        'Distinguish position value, market exposure and capital at risk.',
        'Show how leverage changes financing, path dependence, margin calls and forced-liquidation risk.',
        'Use a hypothetical position-sizing activity based on account risk and stop distance while explaining the limitations of stops.',
        'Compare loss distributions rather than headline win rates or average returns.',
      ],
      [
        'https://iu.com.au/calculate-your-trade-quantity-australian-us-dollar-based-percentage-risk/',
        'https://iu.com.au/drawdown/',
      ],
    ),
  },
  {
    id: 'investment-claims-challenge',
    title: 'Investment claims challenge',
    summary: 'Turn hype, backtests and impressive averages into testable questions.',
    sources: [
      'https://iu.com.au/equal-weight-etfs-vs-market-capitalisation-index-funds-the-real-trade-offs/',
      'https://iu.com.au/retail-vs-institutional-trading-what-australian-investors-must-know/',
    ],
    prompt: buildPrompt(
      'How to Challenge Investment Claims',
      [
        'Teach base rates, correlation versus causation and the difference between uncertainty and missing information.',
        'Explain look-ahead bias, survivorship bias, leakage, repeated testing, overfitting and unrealistic execution costs.',
        'Compare distributions, drawdowns and ruin risk rather than relying on win rate or average return.',
        'Include a red-team exercise where learners identify what is missing from three hypothetical investment promotions.',
      ],
      [
        'https://iu.com.au/equal-weight-etfs-vs-market-capitalisation-index-funds-the-real-trade-offs/',
        'https://iu.com.au/retail-vs-institutional-trading-what-australian-investors-must-know/',
      ],
    ),
  },
] as const;
