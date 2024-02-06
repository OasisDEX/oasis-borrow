import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataPositionDebtParams {
  debtAmount: BigNumber
  quoteToken: string
}

export function useAjnaCardDataPositionDebt({
  debtAmount,
  quoteToken,
}: AjnaCardDataPositionDebtParams): OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.position-debt.title')}
        description={t('omni-kit.content-card.position-debt.modal-description')}
        value={`${formatCryptoBalance(debtAmount)} ${quoteToken}`}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
