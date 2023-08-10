import BigNumber from 'bignumber.js'

export function parseProductNumbers(
  stringNumbers: (string | undefined)[],
): (BigNumber | undefined)[] {
  return stringNumbers.map((number) => (number ? new BigNumber(number) : undefined))
}
