import BigNumber from 'bignumber.js'
import { formatAmount, formatPercent } from 'helpers/formatters/format'

export const stopLossSliderBasicConfig = {
  disabled: false,
  leftBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x)),
  rightBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : '$ ' + formatAmount(x, 'USD')),
  step: 1,
}
