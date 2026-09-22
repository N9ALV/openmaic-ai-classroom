function finite(value: number, label: string, min: number, max: number) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label} must be between ${min} and ${max}.`);
  }
}

export function recoveryGain(lossPercent: number): number | null {
  finite(lossPercent, 'Loss percentage', 0, 100);
  return lossPercent === 100 ? null : (lossPercent / (100 - lossPercent)) * 100;
}

/** Rates are USD per AUD, not their inverse. No fees, tax or hedging included. */
export function audReturn(usdReturnPercent: number, startUsdPerAud: number, endUsdPerAud: number) {
  finite(usdReturnPercent, 'USD return', -100, 100);
  finite(startUsdPerAud, 'Starting USD per AUD', 0.01, 10);
  finite(endUsdPerAud, 'Ending USD per AUD', 0.01, 10);
  return (((1 + usdReturnPercent / 100) * startUsdPerAud) / endUsdPerAud - 1) * 100;
}

/** Constant hypothetical gross return; fee charged on end-of-year value, yearly. */
export function feeBalance(
  principal: number,
  grossReturnPercent: number,
  annualFeePercent: number,
  years: number,
) {
  finite(principal, 'Starting balance', 0, 100_000_000);
  finite(grossReturnPercent, 'Illustrative annual gross return', -100, 100);
  finite(annualFeePercent, 'Annual fee', 0, 50);
  finite(years, 'Years', 0, 60);
  if (!Number.isInteger(years)) throw new Error('Years must be a whole number.');
  return principal * ((1 + grossReturnPercent / 100) * (1 - annualFeePercent / 100)) ** years;
}

/** Fixed year-end withdrawals; no borrowing after capital is exhausted. */
export function withdrawalPath(principal: number, returns: readonly number[], withdrawal: number) {
  finite(principal, 'Starting balance', 0, 100_000_000);
  finite(withdrawal, 'Yearly withdrawal', 0, 100_000_000);
  let balance = principal;
  return returns.map((rate) => {
    finite(rate, 'Annual return', -100, 100);
    const beforeWithdrawal = balance * (1 + rate / 100);
    const paid = Math.min(beforeWithdrawal, withdrawal);
    const shortfall = withdrawal - paid;
    balance = beforeWithdrawal - paid;
    return { balance, paid, shortfall, rate };
  });
}
