import type { Erc4626Position } from '@oasisdex/dma-library'
import {
  OmniContentCard,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { OmniProductType } from 'features/omni-kit/types'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionContentManage: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { quoteToken },
  } = useOmniGeneralContext()
  const {
    position: { currentPosition },
  } = useOmniProductContext(OmniProductType.Earn)

  const position = currentPosition.position as Erc4626Position

  const netValueContentCardCommonData = useOmniCardDataTokensValue({
    tokensAmount: position.netValue,
    tokensSymbol: quoteToken,
    translationCardName: 'net-value',
  })

  const earningsToDateContentCardCommonData = useOmniCardDataTokensValue({
    tokensAmount: position.totalEarnings.withoutFees,
    tokensSymbol: quoteToken,
    translationCardName: 'earnings-to-date',
    footnote: t('erc-4626.content-card.earnings-to-date.footnote'),
  })

  return (
    <>
      <OmniContentCard {...netValueContentCardCommonData} />
      <OmniContentCard {...earningsToDateContentCardCommonData} />
    </>
  )
}
