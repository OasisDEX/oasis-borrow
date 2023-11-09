import type { AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { isShortPosition } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import type { PositionDetail } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'

interface GetAjnaPositionDetailsParams {
  collateralPrice: BigNumber
  fee: BigNumber
  isOracless: boolean
  isProxyWithManyPositions: boolean
  lowestUtilizedPrice: BigNumber
  position: AjnaGenericPosition
  primaryToken: string
  quotePrice: BigNumber
  secondaryToken: string
  type: OmniProductType
}

export function getAjnaPositionDetails({
  collateralPrice,
  fee,
  isOracless,
  isProxyWithManyPositions,
  lowestUtilizedPrice,
  position,
  primaryToken,
  quotePrice,
  secondaryToken,
  type,
}: GetAjnaPositionDetailsParams): PositionDetail[] {
  const isShort = isShortPosition({ collateralToken: primaryToken })
  const priceFormat = isShort
    ? `${secondaryToken}/${primaryToken}`
    : `${primaryToken}/${secondaryToken}`
  const marketPrice = isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice)
  const maxLtv = lowestUtilizedPrice.div(marketPrice)
  const maxMultiple = BigNumber.max(one.plus(one.div(one.div(maxLtv).minus(one))), zero)

  switch (type) {
    case OmniProductType.Borrow: {
      const { collateralAmount, debtAmount, liquidationPrice, riskRatio } = position as AjnaPosition

      const formattedLiquidationPrice = isShort
        ? normalizeValue(one.div(liquidationPrice))
        : liquidationPrice

      return [
        {
          type: 'collateralLocked',
          value: `${formatCryptoBalance(new BigNumber(collateralAmount))} ${primaryToken}`,
        },
        {
          type: 'totalDebt',
          value: `${formatCryptoBalance(new BigNumber(debtAmount))} ${secondaryToken}`,
        },
        {
          type: 'liquidationPrice',
          value: isOracless
            ? 'n/a'
            : `${formatCryptoBalance(new BigNumber(formattedLiquidationPrice))} ${priceFormat}`,
          subvalue: isOracless
            ? 'n/a'
            : `Now ${formatCryptoBalance(new BigNumber(marketPrice))} ${priceFormat}`,
        },
        {
          type: 'ltv',
          value: isOracless ? 'n/a' : formatDecimalAsPercent(riskRatio.loanToValue),
          subvalue: isOracless ? 'n/a' : `Max ${formatDecimalAsPercent(maxLtv)}`,
        },
        {
          type: 'borrowRate',
          value: formatDecimalAsPercent(fee),
        },
      ]
    }
    case OmniProductType.Earn:
      return []
    case OmniProductType.Multiply: {
      const {
        collateralAmount,
        debtAmount,
        liquidationPrice,
        pnl: { withoutFees },
        riskRatio,
      } = position as AjnaPosition

      const netValue = collateralAmount
        .times(collateralPrice)
        .minus(debtAmount.times(quotePrice))
        .toNumber()
      const formattedLiquidationPrice = isShort
        ? normalizeValue(one.div(liquidationPrice))
        : liquidationPrice

      return [
        {
          type: 'netValue',
          value: `$${formatCryptoBalance(new BigNumber(netValue))}`,
        },
        {
          type: 'pnl',
          value: isProxyWithManyPositions ? formatDecimalAsPercent(withoutFees) : 'n/a',
          ...(isProxyWithManyPositions && {
            accent: withoutFees.gt(zero) ? 'positive' : 'negative',
          }),
        },
        {
          type: 'liquidationPrice',
          value: `${formatCryptoBalance(new BigNumber(formattedLiquidationPrice))} ${priceFormat}`,
          subvalue: `Now ${formatCryptoBalance(new BigNumber(marketPrice))} ${priceFormat}`,
        },
        {
          type: 'ltv',
          value: formatDecimalAsPercent(riskRatio.loanToValue),
          subvalue: `Max ${formatDecimalAsPercent(maxLtv)}`,
        },
        {
          type: 'multiple',
          value: `${riskRatio.multiple.toFixed(2)}x`,
          subvalue: `Max ${maxMultiple.toFixed(2)}x`,
        },
      ]
    }
  }
}
