import { BigNumber } from 'bignumber.js'

export function isNullish(amount: BigNumber | undefined | null): boolean {
  return !amount || amount.isZero()
}
