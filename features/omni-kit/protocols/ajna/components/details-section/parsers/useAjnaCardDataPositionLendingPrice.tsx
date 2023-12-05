import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { Steps } from 'components/Steps'
import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { AjnaCardDataPositionLendingPriceModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import { getLendingPriceColor } from 'features/omni-kit/protocols/ajna/helpers'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import React from 'react'

interface AjnaCardDataPositionLendingPriceParams {
  afterLendingPrice?: BigNumber
  highestThresholdPrice: BigNumber
  isLoading?: boolean
  isOracless: boolean
  isShort: boolean
  lendingPrice: BigNumber
  lowestUtilizedPrice: BigNumber
  priceFormat: string
  quoteToken: string
}

export function useAjnaCardDataPositionLendingPrice({
  afterLendingPrice,
  highestThresholdPrice,
  isLoading,
  isOracless,
  isShort,
  lendingPrice,
  lowestUtilizedPrice,
  priceFormat,
  quoteToken,
}: AjnaCardDataPositionLendingPriceParams): OmniContentCardBase & OmniContentCardExtra {
  const lendingPriceColor = getLendingPriceColor({
    highestThresholdPrice,
    lowestUtilizedPrice,
    price: lendingPrice,
  })

  const resolvedLendingPrice = isShort ? normalizeValue(one.div(lendingPrice)) : lendingPrice
  const resolvedAfterLendingPrice = afterLendingPrice
    ? isShort
      ? normalizeValue(one.div(afterLendingPrice))
      : afterLendingPrice
    : undefined
  const resolvedHighestThresholdPrice = isShort
    ? normalizeValue(one.div(highestThresholdPrice))
    : highestThresholdPrice

  return {
    title: { key: 'ajna.content-card.position-lending-price.title' },
    value: formatCryptoBalance(resolvedLendingPrice),
    customValueColor: lendingPriceColor.color,
    unit: priceFormat,
    ...(resolvedAfterLendingPrice && {
      change: ['', formatCryptoBalance(resolvedAfterLendingPrice), priceFormat],
    }),
    extra: !isLoading && !resolvedAfterLendingPrice && (
      <Steps active={lendingPriceColor.index} color={lendingPriceColor.color} count={3} />
    ),
    ...(isOracless && {
      tooltips: {
        value: `${resolvedLendingPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`,
        change:
          resolvedAfterLendingPrice &&
          `${resolvedAfterLendingPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`,
      },
    }),
    modal: (
      <AjnaCardDataPositionLendingPriceModal
        highestThresholdPrice={resolvedHighestThresholdPrice}
        isShort={isShort}
        lendingPrice={lendingPrice}
        priceFormat={priceFormat}
        quoteToken={quoteToken}
      />
    ),
  }
}
