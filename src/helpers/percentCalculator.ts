const getPercentFromNumber = (percent: number, numberFrom: number): number =>
  (numberFrom / 100) * percent;

const getPercentDiffNumberFromNumber = (
  number: number,
  numberFrom: number,
): number => (number / numberFrom) * 100;

export { getPercentFromNumber, getPercentDiffNumberFromNumber };
