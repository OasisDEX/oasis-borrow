import type BigNumber from 'bignumber.js'

import { formatBigNumber } from './formatters/format'

export function displayMultiple(multiple?: BigNumber) {
  return multiple ? `${formatBigNumber(multiple, 2)}x` : ''
}
