import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniCardDataCollateralDepositedModalProps extends OmniContentCardDataWithTheme {
  collateralToken: string
  quoteToken: string
  protocol: string
}

export function OmniCardDataNetApyModal({
  collateralToken,
  quoteToken,
  protocol,
  theme,
}: OmniCardDataCollateralDepositedModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.net-apy.title')}
      description={t('omni-kit.content-card.net-apy.modal-description', {
        collateralToken,
        quoteToken,
        protocol,
      })}
      theme={theme}
    />
  )
}
