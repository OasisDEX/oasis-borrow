import type { MorphoBluePosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { isShortPosition } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import { type PositionDetail } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'

interface GetMorphoPositionDetailsParam {
  collateralPrice: BigNumber
  liquidataionLtv: BigNumber
  position: MorphoBluePosition
  primaryToken: string
  quotePrice: BigNumber
  rate: BigNumber
  secondaryToken: string
  type: OmniProductType
}

export function getMorphoPositionDetails({
  collateralPrice,
  liquidataionLtv,
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
  const marketPrice = isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice)

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
          subvalue: `Max ${formatDecimalAsPercent(liquidataionLtv)}`,
        },
        {
          type: 'borrowRate',
          value: formatDecimalAsPercent(rate),
        },
      ]
    }
    case OmniProductType.Multiply:
    default: {
      return []
    }
  }
}
