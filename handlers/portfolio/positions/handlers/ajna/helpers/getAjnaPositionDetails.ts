import type { AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { isShortPosition } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import type { PositionDetail } from 'handlers/portfolio/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one } from 'helpers/zero'

interface GetAjnaPositionDetailsParams {
  collateralPrice: BigNumber
  fee: BigNumber
  isOracless: boolean
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
  lowestUtilizedPrice,
  position,
  primaryToken,
  quotePrice,
  secondaryToken,
  type,
}: GetAjnaPositionDetailsParams): PositionDetail[] {
  const isShort = isShortPosition({ collateralToken: primaryToken })
  const marketPrice = isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice)

  switch (type) {
    case OmniProductType.Borrow:
      const { collateralAmount, debtAmount, liquidationPrice, riskRatio } = position as AjnaPosition

      const priceFormat = isShort
        ? `${secondaryToken}/${primaryToken}`
        : `${primaryToken}/${secondaryToken}`
      const formattedLiquidationPrice = isShort
        ? normalizeValue(one.div(liquidationPrice))
        : liquidationPrice
      const maxLtv = lowestUtilizedPrice.div(marketPrice)

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
          value: isOracless ? 'n/a' : `${formatDecimalAsPercent(riskRatio.loanToValue)}`,
          subvalue: isOracless ? 'n/a' : `Max ${formatDecimalAsPercent(maxLtv)}`,
        },
        {
          type: 'borrowRate',
          value: `${formatDecimalAsPercent(fee)}`,
        },
      ]
    case OmniProductType.Earn:
    case OmniProductType.Multiply:
      return []
  }
}
