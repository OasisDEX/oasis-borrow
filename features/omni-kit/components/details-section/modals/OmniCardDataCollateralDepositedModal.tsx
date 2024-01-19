import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniCardDataCollateralDepositedModalProps extends OmniContentCardDataWithTheme {
  collateralAmount: BigNumber
  collateralToken: string
}

export function OmniCardDataCollateralDepositedModal({
  collateralAmount,
  collateralToken,
  theme,
}: OmniCardDataCollateralDepositedModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.collateral-deposited.title')}
      description={t('omni-kit.content-card.collateral-deposited.modal-description')}
      value={`${formatCryptoBalance(collateralAmount)} ${collateralToken}`}
      theme={theme}
    />
  )
}
