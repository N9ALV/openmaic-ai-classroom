import type { LearningQuestion } from './lessons';

export interface LearningScenario {
  situation: string;
  workedExample: string;
  reflection: string;
  question: LearningQuestion;
}

export const learningScenarios: Record<string, LearningScenario> = {
  'asx-foundations': {
    situation:
      'Alex needs A$8,000 for a known bill in six months and is considering a share ETF because its recent return looks attractive.',
    workedExample:
      'If the holding fell 25%, A$8,000 would become A$6,000 before costs. A broad ETF can spread company risk while still exposing the whole amount to market losses. The six-month bill does not move because markets fall. Compare the required liquidity and loss capacity with realistic cash alternatives before choosing a vehicle.',
    reflection:
      'Explain which constraint matters most here. What would you check about a cash alternative, including access, fees, inflation and any applicable protection?',
    question: {
      prompt: 'Alex’s bill is due in six months. What should the comparison start with?',
      choices: [
        'The ETF’s best recent year.',
        'The required access date and ability to withstand a shortfall.',
        'The number of ETF units Alex can buy.',
      ],
      correct: 1,
      explanation:
        'A short, fixed liability limits the loss and liquidity risk the money can bear. Product popularity or recent returns do not remove that constraint.',
      feedback: [
        'A recent good year is not a forecast, and the bill still has to be paid.',
        'Correct: match the decision to the liability and genuine constraints.',
        'Unit count says nothing about the likelihood or size of a shortfall.',
      ],
    },
  },
  diversification: {
    situation:
      'Casey owns three differently named funds. Each largely tracks the same Australian large-company index.',
    workedExample:
      'Splitting A$30,000 into three A$10,000 funds does not remove their shared underlying holdings. Compare the combined bank/mining weights, overseas exposure and currency rather than counting three fund labels. Cash, bonds and other assets have different drivers, but also their own inflation, interest-rate and credit risks.',
    reflection:
      'Draw three overlapping circles for the funds. What additional information would tell you whether another investment changes the overall risk?',
    question: {
      prompt: 'What is the most useful next check for these three funds?',
      choices: [
        'Whether their logos differ.',
        'Whether each has more than 100 holdings.',
        'Their combined underlying holdings and economic exposures.',
      ],
      correct: 2,
      explanation:
        'Overlapping holdings can leave three funds behaving like one exposure. Look through them and compare the combined risk.',
      feedback: [
        'Different brands do not imply different underlying exposures.',
        'A large holding count inside each fund can still conceal the same holdings across funds.',
        'Correct: combined exposures reveal overlap that labels conceal.',
      ],
    },
  },
  drawdowns: {
    situation:
      'Two fictional retirees start with A$100,000, withdraw A$10,000 at each year-end and receive −20% and +25% returns in opposite orders.',
    workedExample:
      'Loss first: A$100,000 × 0.80 − A$10,000 = A$70,000; then A$70,000 × 1.25 − A$10,000 = A$77,500. Gain first: A$115,000 after the first withdrawal; then A$82,000. The A$4,500 difference comes from return order interacting with withdrawals, not a different set of returns. Use the sequence exercise to change the assumptions.',
    reflection:
      'Explain why the same two returns can produce different spending outcomes. Identify two practical responses to compare, without assuming either suits every retiree.',
    question: {
      prompt: 'What remains after the loss-first path’s first year and withdrawal?',
      choices: ['A$70,000.', 'A$80,000.', 'A$90,000.'],
      correct: 0,
      explanation:
        'A$100,000 falls to A$80,000, then the A$10,000 year-end withdrawal leaves A$70,000.',
      feedback: [
        'Correct: apply the return first, then the stated withdrawal.',
        'A$80,000 omits the withdrawal.',
        'A$90,000 omits the investment loss.',
      ],
    },
  },
  fees: {
    situation:
      'A simplified investment starts with A$100, earns 5% gross, then charges a 1% fee on the year-end value.',
    workedExample:
      'A$100 × 1.05 × 0.99 = A$103.95. Simply subtracting the percentages gives A$104 and does not match this stated fee convention. Real products may calculate fees differently. Neither number includes inflation, tax, contributions or withdrawals.',
    reflection:
      'How would you check whether two real fee quotes cover the same services and the same charging base?',
    question: {
      prompt: 'What is the final value under this stated fee convention?',
      choices: ['A$105.00.', 'A$104.00.', 'A$103.95.'],
      correct: 2,
      explanation: 'The 1% fee is A$1.05 because it is charged on A$105, leaving A$103.95.',
      feedback: [
        'That is before the fee.',
        'Subtracting percentage points assumes a different charging base.',
        'Correct: the fee applies to the end-of-year value.',
      ],
    },
  },
  currency: {
    situation:
      'A US investment has a 0% USD return. AUD/USD rises from 0.65 to 0.70; no fees or tax are included.',
    workedExample:
      'A$10,000 becomes US$6,500 initially. The unchanged US$6,500 converts back to about A$9,285.71 at 0.70: an AUD loss of about 7.14%. A stable foreign-currency price does not guarantee stable Australian purchasing power.',
    reflection:
      'Explain the result using the units USD per AUD. What changes if future spending is in USD rather than AUD?',
    question: {
      prompt: 'What is the approximate AUD return in this example?',
      choices: [
        '0%, because the investment price did not change.',
        '−7.14%, because the AUD strengthened.',
        '+7.14%, because the exchange-rate number rose.',
      ],
      correct: 1,
      explanation:
        '(0.65 ÷ 0.70 − 1) × 100 is approximately −7.14%. The exchange-rate direction matters.',
      feedback: [
        'That is the USD return, not the AUD return.',
        'Correct: the unchanged USD amount buys fewer AUD.',
        'A higher USD-per-AUD rate means each AUD is stronger, reducing this unhedged AUD result.',
      ],
    },
  },
  'evidence-and-process': {
    situation:
      'A fictional promotion claims a 90% win rate. Assume each win gains A$1 and each loss loses A$20.',
    workedExample:
      'Using these hypothetical probabilities, expected payoff per trade is 0.90 × A$1 − 0.10 × A$20 = −A$1.10 before costs. The assumptions are not a validated strategy. Win rate alone conceals payoff size, clustering, drawdown and the evidence needed to estimate probabilities.',
    reflection:
      'List six missing facts you would request before relying on this promotion. Which fact would most change your conclusion?',
    question: {
      prompt: 'What is the hypothetical expected payoff per trade before costs?',
      choices: ['−A$1.10.', '+A$0.90.', 'A guaranteed gain because most trades win.'],
      correct: 0,
      explanation:
        '0.9 × 1 + 0.1 × (−20) = −1.1. Costs would reduce the result further; a realised path may differ substantially.',
      feedback: [
        'Correct under the stated assumptions; this is not a forecast.',
        'That counts the winning trades but omits the losses.',
        'Frequency of wins cannot establish profitability or safety.',
      ],
    },
  },
};

export const investmentGlossary = [
  {
    term: 'PDS',
    meaning:
      'Product disclosure statement: the provider’s description of a product’s features, risks and costs. Read the document applicable to the exact product.',
  },
  {
    term: 'TMD',
    meaning:
      'Target market determination: describes the consumers for whom a product is designed and relevant distribution conditions. It is not personal suitability advice.',
  },
  {
    term: 'HIN / SRN',
    meaning:
      'A holder identification number identifies a CHESS-sponsored holding arrangement. A securityholder reference number identifies an issuer-sponsored holding. Keep these private.',
  },
  {
    term: 'ETF / LIC / A-REIT',
    meaning:
      'An exchange traded fund, listed investment company and Australian real estate investment trust are different structures. Inspect their actual assets, debt and fees.',
  },
  {
    term: 'Drawdown',
    meaning:
      'A decline from a previous peak. Recovery percentages are measured from the smaller remaining balance.',
  },
  {
    term: 'Sequence risk',
    meaning:
      'The effect of the order of returns, particularly when adding or withdrawing money. An average return alone can hide it.',
  },
  {
    term: 'AUD/USD',
    meaning:
      'US dollars per Australian dollar here. Multiply AUD by the rate to obtain USD; divide USD by the rate to obtain AUD, before costs.',
  },
  {
    term: 'Hedging',
    meaning:
      'Changing an exposure to offset some risk, often using derivatives. It brings costs and limitations and does not promise a better return.',
  },
  {
    term: 'Liquidity',
    meaning:
      'The ability to buy or sell at an acceptable price and time. Normal trading conditions do not establish liquidity during stress.',
  },
  {
    term: 'Spread',
    meaning:
      'The gap between the price buyers bid and the price sellers ask. It is an implementation cost even when brokerage is zero.',
  },
  {
    term: 'Cash and bonds',
    meaning:
      'Cash can support near-term access but loses purchasing power to inflation. Bonds are loans; their prices and repayment depend on interest rates, credit quality and maturity. Neither label removes all risk.',
  },
  {
    term: 'Inflation / real return',
    meaning:
      'Inflation is an increase in prices that reduces purchasing power. Real return is the return after inflation, not simply the dollar income received.',
  },
];
