import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import {
  OmniContentCard,
  useOmniCardDataAverageApy,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import React from 'react'

interface AjnaContentFooterEarnOpenProps {
  isOracless: boolean
  quoteToken: string
  quotePrice: BigNumber
  position: AjnaEarnPosition
}

export function AjnaContentFooterEarnOpen({
  isOracless,
  position,
  quoteToken,
  quotePrice,
}: AjnaContentFooterEarnOpenProps) {
  const totalValueLockedContentCardCommonData = useOmniCardDataTokensValue({
    tokensAmount: position.pool.depositSize,
    tokensSymbol: quoteToken,
    translationCardName: 'total-value-locked',
    usdAsDefault: true,
    ...(!isOracless && { tokensPrice: quotePrice }),
  })

  const averageApyContentCardCommonData = useOmniCardDataAverageApy({
    averageApy: position.poolApy.per7d,
    days: '7',
  })

  return (
    <>
      <OmniContentCard asFooter {...totalValueLockedContentCardCommonData} />
      <OmniContentCard asFooter {...averageApyContentCardCommonData} />
    </>
  )
}
