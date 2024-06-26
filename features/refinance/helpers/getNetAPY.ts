import BigNumber from 'bignumber.js'

export function getNetAPY(currentLTV: string, borrowApy: string, supplyApy: string) {
  const multiple = new BigNumber(1).div(new BigNumber(1).minus(currentLTV))

  const netAPY = new BigNumber(multiple)
    .times(supplyApy)
    .minus(new BigNumber(multiple).minus(1).times(borrowApy))
    .toString()

  return netAPY
}
