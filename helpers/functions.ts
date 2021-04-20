import { BigNumber } from 'bignumber.js'

export function isNullish(amount: BigNumber | undefined | null): Boolean {
  return !amount || amount.isZero()
}
