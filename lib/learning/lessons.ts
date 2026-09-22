import { learningScenarios, type LearningScenario } from './applied-learning';

export interface LearningQuestion {
  prompt: string;
  choices: readonly string[];
  correct: number;
  explanation: string;
  feedback?: readonly string[];
}
export interface LearningLesson {
  id: string;
  title: string;
  minutes: number;
  objectives: readonly string[];
  sections: readonly { heading: string; paragraphs: readonly string[] }[];
  exercise: string;
  scenario: LearningScenario;
  questions: readonly LearningQuestion[];
  sources: readonly { label: string; url: string; role: 'primary' | 'supporting' }[];
}

export const LEARNING_EDITION = '2026-09-22';
export const LEARNING_STATUS = 'Editorial draft — subject-matter approval pending';

// Original pilot teaching material: not copied IU courses, not generated on each
// visit, no current-market estimates or tax thresholds, and no provider calls.
const baseLessons: readonly Omit<LearningLesson, 'scenario'>[] = [
  {
    id: 'asx-foundations',
    title: 'ASX foundations: ownership before action',
    minutes: 8,
    objectives: [
      'Distinguish an investment vehicle from its underlying assets.',
      'Compare shares, ETFs, LICs and A-REITs.',
      'Build a decision checklist before choosing a product.',
    ],
    sections: [
      {
        heading: 'What are you buying?',
        paragraphs: [
          'An ordinary share represents ownership in a company. Your result depends on price changes and distributions, after costs and tax. A dividend is not free extra return: consider the total outcome, not yield alone.',
          'An ETF is a fund traded on an exchange. Some track broad indices; others are active, concentrated, leveraged or exposed to a single asset. The ETF label does not tell you how diversified or conservative it is.',
          'A listed investment company is a company that invests. Its shares may trade above or below the value of its net assets. An Australian real estate investment trust (A-REIT) provides listed property exposure; debt, tenants, asset concentration and refinancing still matter.',
        ],
      },
      {
        heading: 'Ownership, access and product documents',
        paragraphs: [
          'Understand whether holdings are CHESS-sponsored or held through a custodial arrangement. A HIN and an issuer-sponsored SRN identify different holding arrangements. Check legal ownership, transfer costs, security and what happens if the service fails.',
          'Read the applicable product disclosure statement, target market determination, fees and issuer announcements. Trading hours, settlement rules and product availability can change; check the exchange and your broker before acting. This lesson does not fix those changeable details in memory.',
        ],
      },
      {
        heading: 'The first decision is not the first trade',
        paragraphs: [
          'Define the objective, when the money may be needed, cash reserves, debt, risk capacity and the realistic alternative. Keeping cash temporarily while resolving a key uncertainty can be a deliberate decision, not a failure to invest.',
          'A hypothetical allocation in a classroom is an exercise, not a recommended portfolio. Do not move on to derivatives merely because they appear in an advanced-topic list.',
        ],
      },
    ],
    exercise:
      'Compare a broad equity ETF, a single-company share and an A-REIT using underlying assets, concentration, fees, liquidity and debt. Write down two facts you would need from primary documents before selecting any of them. Do not pick a winner without an objective.',
    questions: [
      {
        prompt: 'Does the ETF label guarantee diversification?',
        choices: [
          'Yes, every ETF holds the whole market.',
          'No. Inspect its mandate, holdings and structure.',
          'Yes, if it trades on the ASX.',
        ],
        correct: 1,
        explanation:
          'Trading on an exchange and diversification are separate characteristics. The actual exposures determine concentration.',
      },
      {
        prompt: 'Which is the best starting point?',
        choices: [
          'Buy whichever product has the highest yield.',
          'Use last year’s winner.',
          'Define the objective, constraints and realistic alternative.',
        ],
        correct: 2,
        explanation:
          'Without an objective and constraints, there is no basis for judging whether a product helps.',
      },
    ],
    sources: [
      {
        label: 'ASIC Moneysmart: ETFs',
        url: 'https://moneysmart.gov.au/managed-funds-and-etfs/exchange-traded-funds-etfs',
        role: 'primary',
      },
      {
        label: 'ASIC Moneysmart: LICs',
        url: 'https://moneysmart.gov.au/managed-funds-and-etfs/listed-investment-companies-lics',
        role: 'primary',
      },
      {
        label: 'ASX: investment education',
        url: 'https://www.asx.com.au/investors',
        role: 'primary',
      },
    ],
  },
  {
    id: 'diversification',
    title: 'Diversification: count exposures, not tickers',
    minutes: 7,
    objectives: [
      'Identify shared risks across different holdings.',
      'Distinguish company, market and systemic risk.',
      'Understand why stress changes correlations.',
    ],
    sections: [
      {
        heading: 'A ten-holding portfolio can be one big bet',
        paragraphs: [
          'Several banks, a financial-sector ETF and a home exposed to the same economy may share important drivers. Different names do not necessarily provide different economic exposures.',
          'Map the underlying sectors, countries, currencies, interest-rate sensitivity, leverage and counterparties. Look through funds for overlapping holdings rather than counting each fund as a separate source of diversification.',
        ],
      },
      {
        heading: 'Three different risk questions',
        paragraphs: [
          'Company-specific risk concerns one business or a limited group. Broad diversification can reduce it, though it cannot guarantee against losses.',
          'Systematic risk comes from broad market drivers. Systemic risk involves disruption spreading through the financial system. Owning more shares does not remove either risk. Assets that look independent in calm conditions may fall together under stress.',
        ],
      },
      {
        heading: 'Diversification has trade-offs',
        paragraphs: [
          'Global exposure can reduce reliance on the Australian economy while introducing currency exposure. A hedged fund changes, but does not eliminate, risk or cost.',
          'Equal weighting reduces dominance by the largest names but changes sector and factor exposures and can increase turnover. A different weighting method is not automatically an improvement after implementation costs.',
        ],
      },
    ],
    exercise:
      'Draw a risk map for a fictional portfolio: bank shares, a property trust, a domestic index fund and an international fund. Stress it with higher interest rates, an Australian recession and a stronger AUD. Mark shared risks and uncertainties, without forecasting the scenario.',
    questions: [
      {
        prompt: 'What is stronger evidence of diversification?',
        choices: [
          'Many investment account numbers.',
          'Low overlap in underlying economic risks.',
          'Every holding has a different name.',
        ],
        correct: 1,
        explanation: 'The drivers of losses matter more than the number of accounts or labels.',
      },
      {
        prompt: 'Can a diversified equity portfolio still fall substantially?',
        choices: [
          'Yes. Broad market risk remains.',
          'No. Diversification prevents losses.',
          'Only if it has fewer than ten holdings.',
        ],
        correct: 0,
        explanation:
          'Diversification reduces some risks, not all risks. Correlations can rise in stressed markets.',
      },
    ],
    sources: [
      {
        label: 'ASIC Moneysmart: diversification',
        url: 'https://moneysmart.gov.au/how-to-invest/diversification',
        role: 'primary',
      },
      {
        label: 'IU: risk distinctions',
        url: 'https://iu.com.au/idiosyncratic-systematic-systemic-risk-the-crucial-distinctions/',
        role: 'supporting',
      },
      {
        label: 'IU: equal-weight ETF trade-offs',
        url: 'https://iu.com.au/equal-weight-etfs-vs-market-capitalisation-index-funds-the-real-trade-offs/',
        role: 'supporting',
      },
    ],
  },
  {
    id: 'drawdowns',
    title: 'Drawdowns, recovery and retirement withdrawals',
    minutes: 8,
    objectives: [
      'Calculate recovery after a loss.',
      'Separate risk capacity from comfort.',
      'See sequence risk in a worked example.',
    ],
    sections: [
      {
        heading: 'Loss and recovery are asymmetric',
        paragraphs: [
          'A fall from A$100 to A$80 is a 20% loss. Returning from A$80 to A$100 requires a 25% gain. The required gain is loss ÷ (1 − loss), using fractions. A 50% loss requires a 100% gain; a complete loss cannot be recovered by a return on zero capital.',
          'Position value is not the same as capital at risk. A stop-loss does not guarantee an exit price when markets gap or liquidity disappears. Leverage can force an exit before a long-term thesis has time to work.',
        ],
      },
      {
        heading: 'The order of returns matters with withdrawals',
        paragraphs: [
          'Illustration only: start with A$100 and withdraw A$10 at each year-end. With returns of −20% then +25%, the balances after withdrawals are A$70 then A$77.50. Reverse the returns and the balances are A$115 then A$82. These paths have the same returns in a different order, but different final wealth.',
          'Without withdrawals, both paths finish at A$100. The withdrawal timing creates the difference. This two-year arithmetic exercise is not a retirement forecast; inflation, tax, longevity and many more return paths matter.',
        ],
      },
      {
        heading: 'Use the genuine constraint',
        paragraphs: [
          'Risk capacity is the financial ability to withstand loss without derailing essential needs. Risk tolerance is emotional willingness. A target return may imply risk, but a desired result does not increase either capacity or tolerance.',
          'Possible responses include changing spending flexibility, timeframe, savings or the objective. Compare these before assuming extra leverage is the solution.',
        ],
      },
    ],
    exercise:
      'Use the recovery calculator below for losses of 10%, 20%, 40% and 50%. Then recalculate the two-year withdrawal example with A$5 rather than A$10 withdrawn. Explain why a single average return cannot describe retirement risk.',
    questions: [
      {
        prompt: 'What gain recovers a 20% loss?',
        choices: ['20%', '25%', '40%'],
        correct: 1,
        explanation:
          'A$80 × 1.25 = A$100. Gains are measured from the smaller remaining capital base.',
      },
      {
        prompt: 'A retiree is comfortable with risk but cannot afford a large loss. What governs?',
        choices: [
          'Comfort alone.',
          'The return they want.',
          'The tighter genuine constraint: financial capacity.',
        ],
        correct: 2,
        explanation: 'Emotional willingness does not remove cash-flow needs or loss consequences.',
      },
    ],
    sources: [
      {
        label: 'ASIC Moneysmart: risk and return',
        url: 'https://moneysmart.gov.au/how-to-invest',
        role: 'primary',
      },
      { label: 'IU: drawdown', url: 'https://iu.com.au/drawdown/', role: 'supporting' },
    ],
  },
  {
    id: 'fees',
    title: 'Fees compound too',
    minutes: 6,
    objectives: [
      'Compare outcomes after fees.',
      'Distinguish fund fees from all-in costs.',
      'Treat projections as assumptions, not forecasts.',
    ],
    sections: [
      {
        heading: 'Small annual differences can accumulate',
        paragraphs: [
          'If a fixed percentage fee is charged each year, both the fee and the return forgone on that fee affect the final balance. Our lab applies a hypothetical constant gross return, then charges the fee on the year-end balance.',
          'The formula is starting balance × [(1 + gross return) × (1 − fee)]^years. Different real products charge fees differently. This simplified model isolates the concept; it does not predict a fund’s result.',
        ],
      },
      {
        heading: 'The advertised management fee is not the whole bill',
        paragraphs: [
          'Consider brokerage, bid/ask spreads, currency conversion, platform and advice fees, financing, tax, tracking differences and the cost of your time. An apparently free service may recover costs elsewhere.',
          'Lower fees are valuable all else equal, but unlike investments cannot be ranked on price alone. Compare suitable exposures, service, liquidity and risk on a consistent basis. A cheap unsuitable product remains unsuitable.',
        ],
      },
    ],
    exercise:
      'Compare A$10,000 over 20 years at an illustrative 5% gross annual return, with annual fees of 0.3% and 1%. Then set the gross return to 0%. Explain the assumptions and what additional costs a real comparison would include.',
    questions: [
      {
        prompt: 'Does zero brokerage mean an investment has no costs?',
        choices: [
          'Yes.',
          'No: spreads, currency costs and other fees can remain.',
          'Only for international shares.',
        ],
        correct: 1,
        explanation: 'The trade commission is one component of all-in implementation costs.',
      },
      {
        prompt: 'What does a constant-return calculator produce?',
        choices: [
          'A hypothetical result under stated assumptions.',
          'A reliable forecast.',
          'A guaranteed balance.',
        ],
        correct: 0,
        explanation: 'Precise arithmetic does not make the assumed return realistic or certain.',
      },
    ],
    sources: [
      {
        label: 'ASIC Moneysmart: managed funds',
        url: 'https://moneysmart.gov.au/managed-funds-and-etfs',
        role: 'primary',
      },
    ],
  },
  {
    id: 'currency',
    title: 'USD assets, AUD outcomes',
    minutes: 7,
    objectives: [
      'Keep exchange-rate units explicit.',
      'Combine an asset return and currency movement.',
      'Separate hedging from return prediction.',
    ],
    sections: [
      {
        heading: 'Always label the exchange-rate direction',
        paragraphs: [
          'Here, AUD/USD means US dollars per Australian dollar. At 0.65, A$1 buys US$0.65 before costs. Convert AUD to USD by multiplying; convert USD to AUD by dividing.',
          'For an unhedged investment, AUD return = (1 + USD asset return) × (starting USD per AUD ÷ ending USD per AUD) − 1. Asset and currency returns compound; simply adding headline percentages can mislead.',
        ],
      },
      {
        heading: 'Worked example',
        paragraphs: [
          'Illustration only: A$10,000 converted at 0.65 buys US$6,500. A 10% USD gain gives US$7,150. At an ending rate of 0.70, this converts to about A$10,214.29, a 2.14% AUD gain before costs and tax.',
          'A stronger AUD reduced the Australian-dollar result. A weaker AUD would increase it, all else equal. Neither direction is a forecast. Currency may diversify some risks while adding others.',
        ],
      },
      {
        heading: 'Hedging changes the exposure',
        paragraphs: [
          'A hedged fund aims to reduce currency effects, usually with derivatives. Hedging can have costs, imperfect coverage and different outcomes from an unhedged holding. It is not a promise of better returns.',
          'For a retiree spending in AUD, assess both the underlying investment and the currency exposure relative to future spending. Do not accept a USD yield as an AUD income promise.',
        ],
      },
    ],
    exercise:
      'Use the currency lab to compare a 10% USD asset gain with ending AUD/USD rates of 0.60, 0.65 and 0.70 from a 0.65 start. Name the costs and tax items omitted.',
    questions: [
      {
        prompt: 'At AUD/USD 0.65, converting US$650 to AUD before costs requires…',
        choices: ['Multiplying by 0.65.', 'Dividing by 0.65.', 'Subtracting 0.65.'],
        correct: 1,
        explanation: 'US$650 ÷ 0.65 USD/AUD = A$1,000. Units determine the operation.',
      },
      {
        prompt: 'Does a 10% USD return guarantee a 10% AUD return?',
        choices: [
          'Yes.',
          'Yes, for every ETF.',
          'No. Currency changes and implementation costs affect it.',
        ],
        correct: 2,
        explanation: 'The investor’s spending currency is part of performance measurement.',
      },
    ],
    sources: [
      {
        label: 'RBA: exchange rates',
        url: 'https://www.rba.gov.au/statistics/frequency/exchange-rates.html',
        role: 'primary',
      },
      {
        label: 'IU: currency-aware position sizing',
        url: 'https://iu.com.au/calculate-your-trade-quantity-australian-us-dollar-based-percentage-risk/',
        role: 'supporting',
      },
    ],
  },
  {
    id: 'evidence-and-process',
    title: 'From investment story to a DEEP decision record',
    minutes: 9,
    objectives: [
      'Challenge attractive claims with evidence.',
      'Use Discover, Educate, Evaluate, Perform without rushing to action.',
      'Create a reusable decision and review record.',
    ],
    sections: [
      {
        heading: 'A good story is not a demonstrated edge',
        paragraphs: [
          'A backtest can be distorted by future information, missing failed instruments, repeated experimentation, overfitting or unrealistic fills. Ask what was known when each decision was made and whether costs, slippage, financing and tax were included.',
          'A high win rate can conceal rare devastating losses. Examine the payoff distribution, drawdown, leverage, liquidity and the possibility of ruin. Paper performance is not proof of reliable live execution.',
        ],
      },
      {
        heading: 'Apply IU’s DEEP framework with human control',
        paragraphs: [
          'Discover: define the question and collect candidate opportunities without treating discovery as endorsement. Educate: learn enough to describe how each exposure works and fails.',
          'Evaluate: compare against a realistic alternative net of costs, using evidence, assumptions and stress cases. Perform: implement only an approved decision within defined authority, then monitor and review it. This lesson does not execute any financial action.',
          'IU’s Home Wealth-Fund idea treats the work as a structured operation. Research, analysis, challenge, records and oversight are separate responsibilities. AI can assist; it does not remove accountability or the need to check evidence.',
        ],
      },
      {
        heading: 'Minimum decision record',
        paragraphs: [
          'Record the objective, horizon, entity, constraints, alternatives, evidence dates, costs, downside, currency exposure, position size, approval and next review trigger. State the fact most likely to reverse the decision.',
          'Keep facts separate from assumptions and forecasts. Keep passwords and account identifiers out of prompts and learning files. A well-run process can still have a poor outcome; use reviews to identify process failures rather than judging only by recent returns.',
        ],
      },
    ],
    exercise:
      'Challenge this fictional promotion: “Our model wins 90% of trades, so a larger position is safe.” List six missing facts. Draft a DEEP decision record whose current conclusion is “insufficient evidence”, and specify what would justify changing it.',
    questions: [
      {
        prompt: 'What can a 90% win rate tell us on its own?',
        choices: [
          'The strategy is profitable.',
          'Large positions are safe.',
          'Too little: the size and distribution of wins and losses matter.',
        ],
        correct: 2,
        explanation:
          'Frequent small wins can be outweighed by infrequent large losses, especially after costs and leverage.',
      },
      {
        prompt: 'What belongs in a decision record?',
        choices: [
          'Only the latest result.',
          'Evidence, assumptions, alternatives, downside and review triggers.',
          'Only the model’s confidence.',
        ],
        correct: 1,
        explanation: 'A durable record makes reasoning testable and supports disciplined review.',
      },
    ],
    sources: [
      {
        label: 'IU: AI-Enhanced Home Wealth-Fund course',
        url: 'https://iu.com.au/courses/the-ai-enhanced-home-wealth-fund/',
        role: 'supporting',
      },
      {
        label: 'IU: IQ Wealth and the DEEP process',
        url: 'https://iu.com.au/iq-wealth-desktop/',
        role: 'supporting',
      },
      {
        label: 'ASIC Moneysmart: investing',
        url: 'https://moneysmart.gov.au/how-to-invest',
        role: 'primary',
      },
    ],
  },
];

export const learningLessons: readonly LearningLesson[] = baseLessons.map((lesson) => ({
  ...lesson,
  minutes: lesson.minutes + 3,
  scenario: learningScenarios[lesson.id],
  questions: [...lesson.questions, learningScenarios[lesson.id].question],
}));

/** Content-sensitive local-progress key; not a security signature. */
export function lessonVersion(lesson: LearningLesson): string {
  let hash = 2166136261;
  for (const character of JSON.stringify(lesson))
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `${LEARNING_EDITION}-${(hash >>> 0).toString(16)}`;
}

export function lessonWorkbook(lesson: LearningLesson): string {
  return [
    `# ${lesson.title}`,
    `Edition: ${LEARNING_EDITION}`,
    LEARNING_STATUS,
    'General education, not personal financial advice. Examples are hypothetical. This is original pilot material, not an official IU course.',
    '## Learning objectives',
    ...lesson.objectives.map((text) => `- ${text}`),
    ...lesson.sections.flatMap((section) => [`## ${section.heading}`, ...section.paragraphs]),
    '## Practice',
    lesson.exercise,
    '## Applied scenario (hypothetical)',
    lesson.scenario.situation,
    lesson.scenario.workedExample,
    '## Explain it in your own words',
    lesson.scenario.reflection,
    '## Knowledge check',
    ...lesson.questions.flatMap((question, index) => [
      `${index + 1}. ${question.prompt}`,
      ...question.choices.map((choice, i) => `   ${i + 1}. ${choice}`),
    ]),
    '## Answer explanations',
    ...lesson.questions.map((q, i) => `${i + 1}. ${q.choices[q.correct]} — ${q.explanation}`),
    '## Further reading (links, not a claim of live verification)',
    ...lesson.sources.map((source) => `- ${source.label} (${source.role}): ${source.url}`),
  ].join('\n\n');
}
