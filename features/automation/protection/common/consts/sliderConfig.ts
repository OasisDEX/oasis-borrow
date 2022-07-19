import BigNumber from 'bignumber.js'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { SxStyleProp } from 'theme-ui'

export const stopLossSliderBasicConfig = {
  disabled: false,
  sliderKey: 'set-stoploss',
  leftBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x)),
  leftBoundryStyling: { fontWeight: 'semiBold', textAlign: 'right' } as SxStyleProp,
  rightBoundryFormatter: (x: BigNumber) => (x.isZero() ? '-' : '$ ' + formatAmount(x, 'USD')),
  rightBoundryStyling: {
    fontWeight: 'semiBold',
    textAlign: 'right',
    color: 'primary100',
  } as SxStyleProp,
  step: 1,
}
