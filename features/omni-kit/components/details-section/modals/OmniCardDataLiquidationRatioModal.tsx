import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { AppLink } from 'components/Links'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface OmniCardDataLiquidationPriceModalProps extends OmniContentCardDataWithTheme {
  ratioLink: string
  collateralToken: string
  quoteToken: string
}

export function OmniCardDataLiquidationRatioModal({
  ratioLink,
  theme,
  collateralToken,
  quoteToken,
}: OmniCardDataLiquidationPriceModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.liquidation-ratio.title')}
      description={
        <Trans
          i18nKey="omni-kit.content-card.liquidation-ratio.modal-description"
          components={[
            <AppLink key="DUNE_ORG_STETHETH_PEG_HISTORY" target="_blank" href={ratioLink} />,
            <br />,
          ]}
          values={{ collateralToken, quoteToken }}
        />
      }
      theme={theme}
    >
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('omni-kit.content-card.liquidation-ratio.modal-footnote-description')}
      </Text>
    </DetailsSectionContentSimpleModal>
  )
}
