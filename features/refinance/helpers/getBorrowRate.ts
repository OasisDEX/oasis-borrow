import BigNumber from 'bignumber.js'
import { aaveLikeAprToApy } from 'handlers/product-hub/helpers'

export function getNetAPY(currentLTV: string, borrowAPR: string, supplyAPR: string) {
  const multiple = new BigNumber(1).div(new BigNumber(1).minus(currentLTV))
  const _borrowAPR = new BigNumber(borrowAPR)
  const borrowAPY = aaveLikeAprToApy(_borrowAPR)
  const _supplyAPR = new BigNumber(supplyAPR)
  const supplyAPY = aaveLikeAprToApy(_supplyAPR)

  const netAPY = new BigNumber(multiple)
    .times(supplyAPY)
    .minus(new BigNumber(multiple).minus(1).times(borrowAPY))
    .negated() // TODO: remember to remove this negation when enabling netAPY on the UI
    .toString()

  return netAPY
}
