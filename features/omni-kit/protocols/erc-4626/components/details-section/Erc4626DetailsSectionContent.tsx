import type { Erc4626Position } from '@oasisdex/dma-library'
import { DetailsSectionContentTable } from 'components/DetailsSectionContentTable'
import {
  OmniContentCard,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { Erc4626DetailsSectionContentEstimatedEarnings } from 'features/omni-kit/protocols/erc-4626/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

export const Erc4626DetailsSectionContent: FC = () => {
  const { t } = useTranslation()

  const {
    environment: { isOpening, quoteToken },
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
      {isOpening ? (
        <DetailsSectionContentTable
          headers={[
            t('omni-kit.position-page.earn.open.duration'),
            t('omni-kit.position-page.earn.open.estimated-earnings'),
            t('omni-kit.position-page.earn.open.net-value'),
          ]}
          rows={[
            [
              t('omni-kit.position-page.earn.open.earnings-per-1d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={zero}
                rewards={[{ amount: zero, token: 'MORPHO' }]}
              />,
              `${formatCryptoBalance(zero)} ${quoteToken}`,
            ],
            [
              t('omni-kit.position-page.earn.open.earnings-per-30d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={zero}
                rewards={[{ amount: zero, token: 'MORPHO' }]}
              />,
              `${formatCryptoBalance(zero)} ${quoteToken}`,
            ],
            [
              t('omni-kit.position-page.earn.open.earnings-per-365d'),
              <Erc4626DetailsSectionContentEstimatedEarnings
                estimatedEarnings={zero}
                rewards={[{ amount: zero, token: 'MORPHO' }]}
              />,
              `${formatCryptoBalance(zero)} ${quoteToken}`,
            ],
          ]}
          footnote={<>{t('omni-kit.position-page.earn.open.disclaimer')}</>}
        />
      ) : (
        <>
          <OmniContentCard {...netValueContentCardCommonData} />
          <OmniContentCard {...earningsToDateContentCardCommonData} />
        </>
      )}
    </>
  )
}
