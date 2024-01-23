import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniCardDataPositionDebtModalProps extends OmniContentCardDataWithTheme {
  debtAmount: BigNumber
  quoteToken: string
}

export function OmniCardDataPositionDebtModal({
  debtAmount,
  quoteToken,
  theme,
}: OmniCardDataPositionDebtModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.position-debt.title')}
      description={t('omni-kit.content-card.position-debt.modal-description')}
      value={`${formatCryptoBalance(debtAmount)} ${quoteToken}`}
      theme={theme}
    />
  )
}
