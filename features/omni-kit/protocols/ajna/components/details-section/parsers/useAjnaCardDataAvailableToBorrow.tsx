import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataAvailableToBorrowParams {
  availableToBorrow: BigNumber
  quoteToken: string
}

export function useAjnaCardDataAvailableToBorrow({
  availableToBorrow,
  quoteToken,
}: AjnaCardDataAvailableToBorrowParams): OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.available-to-borrow.title')}
        description={t('ajna.content-card.available-to-borrow.modal-description')}
        value={`${formatCryptoBalance(availableToBorrow)} ${quoteToken}`}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
