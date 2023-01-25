import BigNumber from 'bignumber.js'

import { formatBigNumber, formatDecimalAsPercent } from './formatters/format'

export function displayMultiple(multiple?: BigNumber) {
  return multiple ? `${formatBigNumber(multiple, 2)}x` : ''
}
