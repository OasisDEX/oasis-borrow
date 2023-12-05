import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataAvailableToWithdrawEarnParams {
  availableToWithdraw: BigNumber
  quoteToken: string
}

export function useAjnaCardDataAvailableToWithdrawEarn({
  availableToWithdraw,
  quoteToken,
}: AjnaCardDataAvailableToWithdrawEarnParams): OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.available-to-withdraw.title')}
        description={t('ajna.content-card.available-to-withdraw.modal-earn-description')}
        value={`${formatCryptoBalance(availableToWithdraw)} ${quoteToken}`}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
