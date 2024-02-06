import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniCardDataAvailableToBorrowProps extends OmniContentCardDataWithTheme {
  availableToBorrow: BigNumber
  quoteToken: string
}

export function OmniCardDataAvailableToBorrow({
  availableToBorrow,
  quoteToken,
  theme,
}: OmniCardDataAvailableToBorrowProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.available-to-borrow.title')}
      description={t('omni-kit.content-card.available-to-borrow.modal-description')}
      value={`${formatCryptoBalance(availableToBorrow)} ${quoteToken}`}
      theme={theme}
    />
  )
}
