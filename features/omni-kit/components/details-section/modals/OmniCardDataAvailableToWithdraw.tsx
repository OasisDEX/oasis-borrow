import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniCardDataAvailableToWithdrawProps extends OmniContentCardDataWithTheme {
  availableToWithdraw: BigNumber
  tokenSymbol: string
  type?: 'lend' | 'supply'
}

export function OmniCardDataAvailableToWithdraw({
  availableToWithdraw,
  tokenSymbol,
  theme,
  type = 'lend',
}: OmniCardDataAvailableToWithdrawProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.available-to-withdraw.title')}
      description={t(`omni-kit.content-card.available-to-withdraw.modal-description-${type}`)}
      value={`${formatCryptoBalance(availableToWithdraw)} ${tokenSymbol}`}
      theme={theme}
    />
  )
}
