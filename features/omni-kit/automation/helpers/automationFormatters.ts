import type BigNumber from 'bignumber.js'
import { formatAmount, formatPercent } from 'helpers/formatters/format'

export const getStopLossFormatters = ({
  isShort,
  collateralTokenSymbol,
  quoteTokenSymbol,
  priceFormat,
}: {
  isShort: boolean
  collateralTokenSymbol: string
  quoteTokenSymbol: string
  priceFormat: string
}) => {
  const denominationToken = isShort ? collateralTokenSymbol : quoteTokenSymbol
  const leftFormatter = (x: BigNumber) => (x.isZero() ? '-' : formatPercent(x, { precision: 2 }))
  const rightFormatter = (x: BigNumber) =>
    x.isZero() ? '-' : `${formatAmount(x, denominationToken)} ${priceFormat}`
  return { leftFormatter, rightFormatter }
}
