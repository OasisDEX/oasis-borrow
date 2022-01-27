import { BigNumber } from 'bignumber.js'

export function roundToThousand(value: BigNumber) {
  return new BigNumber(Math.floor(value.div(1000).toNumber()).toFixed(0)).multipliedBy(1000)
}
