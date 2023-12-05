import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataAvailableToWithdrawLendingParams {
  availableToWithdraw: BigNumber
  collateralToken: string
}

export function useAjnaCardDataAvailableToWithdrawLending({
  availableToWithdraw,
  collateralToken,
}: AjnaCardDataAvailableToWithdrawLendingParams): OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.available-to-withdraw.title')}
        description={t('ajna.content-card.available-to-withdraw.modal-description')}
        value={`${formatCryptoBalance(availableToWithdraw)} ${collateralToken}`}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
