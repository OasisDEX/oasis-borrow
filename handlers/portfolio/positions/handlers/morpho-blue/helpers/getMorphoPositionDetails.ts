import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { isShortPosition } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { type PositionDetail } from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'

interface GetMorphoPositionDetailsParam {
  collateralPrice: BigNumber
  liquidationRatio: BigNumber
  position: MorphoBluePosition
  primaryToken: string
  quotePrice: BigNumber
  rate: BigNumber
  secondaryToken: string
  type: OmniProductType
}

export function getMorphoPositionDetails({
  collateralPrice,
  liquidationRatio,
  position,
  primaryToken,
  quotePrice,
  rate,
  secondaryToken,
  type,
}: GetMorphoPositionDetailsParam): PositionDetail[] {
  const isShort = isShortPosition({ collateralToken: primaryToken })
  const priceFormat = isShort
    ? `${secondaryToken}/${primaryToken}`
    : `${primaryToken}/${secondaryToken}`
  const marketPrice = isShort ? one.div(position.marketPrice) : position.marketPrice

  switch (type) {
    case OmniProductType.Borrow: {
      const { collateralAmount, debtAmount, liquidationPrice, riskRatio } = position

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
          value: `${formatCryptoBalance(new BigNumber(formattedLiquidationPrice))} ${priceFormat}`,
          subvalue: `Now ${formatCryptoBalance(new BigNumber(marketPrice))} ${priceFormat}`,
        },
        {
          type: 'ltv',
          value: formatDecimalAsPercent(riskRatio.loanToValue),
          subvalue: `Max ${formatDecimalAsPercent(liquidationRatio)}`,
        },
        {
          type: 'borrowRate',
          value: formatDecimalAsPercent(rate),
        },
      ]
    }
    case OmniProductType.Multiply: {
      const {
        collateralAmount,
        debtAmount,
        liquidationPrice,
        pnl: { withoutFees },
        riskRatio,
        maxRiskRatio,
      } = position as MorphoBluePosition

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
          value: formatUsdValue(new BigNumber(netValue)),
        },
        {
          type: 'pnl',
          value: formatDecimalAsPercent(withoutFees),
          accent: withoutFees.gt(zero) ? 'positive' : 'negative',
        },
        {
          type: 'liquidationPrice',
          value: `${formatCryptoBalance(new BigNumber(formattedLiquidationPrice))} ${priceFormat}`,
          subvalue: `Now ${formatCryptoBalance(new BigNumber(marketPrice))} ${priceFormat}`,
        },
        {
          type: 'ltv',
          value: formatDecimalAsPercent(riskRatio.loanToValue),
          subvalue: `Max ${formatDecimalAsPercent(maxRiskRatio.loanToValue)}`,
        },
        {
          type: 'multiple',
          value: `${riskRatio.multiple.toFixed(2)}x`,
          subvalue: `Max ${maxRiskRatio.multiple.toFixed(2)}x`,
        },
      ]
    }
    default: {
      return []
    }
  }
}
