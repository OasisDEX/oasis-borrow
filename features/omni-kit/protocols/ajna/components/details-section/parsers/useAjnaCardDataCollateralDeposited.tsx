import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataCollateralDepositedParams {
  collateralAmount: BigNumber
  collateralToken: string
}

export function useAjnaCardDataCollateralDeposited({
  collateralAmount,
  collateralToken,
}: AjnaCardDataCollateralDepositedParams): OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.collateral-deposited.title')}
        description={t('ajna.content-card.collateral-deposited.modal-description')}
        value={`${formatCryptoBalance(collateralAmount)} ${collateralToken}`}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
