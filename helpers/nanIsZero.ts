import type BigNumber from 'bignumber.js'

import { zero } from './zero'

export function NaNIsZero(number: BigNumber) {
  return number.isNaN() ? zero : number
}
