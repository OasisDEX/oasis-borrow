import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataNetValueEarnParams {
  netValue: BigNumber
  quoteToken: string
}

export function useAjnaCardDataNetValueEarn({
  netValue,
  quoteToken,
}: AjnaCardDataNetValueEarnParams): OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.net-value.title')}
        description={t('ajna.content-card.net-value.modal-earn-description')}
        value={`${formatCryptoBalance(netValue)} ${quoteToken}`}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
