import type BigNumber from 'bignumber.js'
import { lambdaPercentageDenomination } from 'features/aave/constants'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'

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
  const leftFormatter = (x: BigNumber) =>
    x.isZero() ? '-' : formatDecimalAsPercent(x.times(lambdaPercentageDenomination).div(100))
  const rightFormatter = (x: BigNumber) =>
    x.isZero() ? '-' : `${formatAmount(x, denominationToken)} ${priceFormat}`
  return { leftFormatter, rightFormatter }
}

export const lambdaParsePercentageValueDown = (val: BigNumber) =>
  val.div(100).div(lambdaPercentageDenomination)
export const lambdaParsePercentageValueUp = (val: BigNumber) =>
  val.times(100).times(lambdaPercentageDenomination)
