import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { isShortPosition } from 'features/omni-kit/helpers'
import { getIsActiveWhenLupBelowHtp } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import { OmniProductType } from 'features/omni-kit/types'
import { notAvailable } from 'handlers/portfolio/constants'
import { LendingRangeType, type PositionDetail } from 'handlers/portfolio/types'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'

interface GetAjnaPositionDetailsParams {
  collateralPrice: BigNumber
  isOracless: boolean
  isProxyWithManyPositions: boolean
  position: AjnaGenericPosition
  primaryToken: string
  quotePrice: BigNumber
  secondaryToken: string
  type: OmniProductType
}

export function getAjnaPositionDetails({
  collateralPrice,
  isOracless,
  position,
  primaryToken,
  quotePrice,
  secondaryToken,
  type,
}: GetAjnaPositionDetailsParams): PositionDetail[] {
  const {
    pool: { highestThresholdPrice, lowestUtilizedPrice, interestRate },
  } = position
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
            ? notAvailable
            : `${formatCryptoBalance(new BigNumber(formattedLiquidationPrice))} ${priceFormat}`,
          ...(!isOracless && {
            subvalue: `Now ${formatCryptoBalance(new BigNumber(marketPrice))} ${priceFormat}`,
          }),
        },
        {
          type: 'ltv',
          value: isOracless ? notAvailable : formatDecimalAsPercent(riskRatio.loanToValue),
          ...(!isOracless && {
            subvalue: `Max ${formatDecimalAsPercent(maxLtv)}`,
          }),
        },
        {
          type: 'borrowRate',
          value: formatDecimalAsPercent(interestRate),
        },
      ]
    }
    case OmniProductType.Earn: {
      const {
        pool: { lendApr },
        poolApy: { per90d },
        price,
        quoteTokenAmount,
        totalEarnings: { withoutFees },
      } = position as AjnaEarnPosition

      const netValue = quoteTokenAmount.times(quotePrice)

      return [
        {
          type: 'netValue',
          value: formatUsdValue(new BigNumber(netValue)),
        },
        {
          type: 'lendingRange',
          value: getIsActiveWhenLupBelowHtp({ price, lowestUtilizedPrice, highestThresholdPrice })
            ? LendingRangeType.Active
            : price.lt(highestThresholdPrice)
              ? LendingRangeType.Unutilized
              : price.lt(lowestUtilizedPrice)
                ? LendingRangeType.Available
                : LendingRangeType.Active,
          ...(price.gte(lowestUtilizedPrice) && { accent: 'positive' }),
        },
        {
          type: 'earnings',
          value: `${formatCryptoBalance(new BigNumber(withoutFees))} ${secondaryToken}`,
        },
        {
          type: 'apy',
          value: lendApr ? formatDecimalAsPercent(lendApr) : notAvailable,
        },
        {
          type: '90dApy',
          value: per90d ? formatDecimalAsPercent(per90d) : notAvailable,
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
