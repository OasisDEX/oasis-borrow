import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { AjnaCardDataThresholdPriceModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'

interface OmniCardDataLtvParams {
  afterThresholdPrice?: BigNumber
  collateralAmount: BigNumber
  debtAmount: BigNumber
  lup?: BigNumber
  thresholdPrice: BigNumber
  unit: string
}

export function useAjnaCardCardThresholdPrice({
  afterThresholdPrice,
  collateralAmount,
  debtAmount,
  lup,
  thresholdPrice,
  unit,
}: OmniCardDataLtvParams): OmniContentCardBase & OmniContentCardExtra {
  return {
    title: { key: 'ajna.content-card.threshold-price.title' },
    unit,
    value: formatCryptoBalance(thresholdPrice),
    ...(afterThresholdPrice && {
      change: ['', formatCryptoBalance(afterThresholdPrice), unit],
    }),
    ...(lup && {
      footnote: [
        { key: 'ajna.content-card.threshold-price.footnote' },
        formatCryptoBalance(lup),
        unit,
      ],
    }),
    tooltips: {
      value: thresholdPrice.gt(zero) && `${thresholdPrice.dp(DEFAULT_TOKEN_DIGITS)} ${unit}`,
      change:
        afterThresholdPrice &&
        afterThresholdPrice.gt(zero) &&
        `${afterThresholdPrice.dp(DEFAULT_TOKEN_DIGITS)} ${unit}`,
      footnote: lup && `${lup.dp(DEFAULT_TOKEN_DIGITS)} ${unit}`,
    },
    modal: (
      <AjnaCardDataThresholdPriceModal
        collateralAmount={collateralAmount}
        debtAmount={debtAmount}
        thresholdPrice={thresholdPrice}
        lup={lup}
      />
    ),
  }
}
