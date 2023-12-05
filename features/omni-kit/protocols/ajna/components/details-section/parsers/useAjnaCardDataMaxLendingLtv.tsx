import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataMaxLendingLtvParams {
  maxLtv: BigNumber
  afterMaxLtv?: BigNumber
}

export function useAjnaCardDataMaxLendingLtv({
  maxLtv,
  afterMaxLtv,
}: AjnaCardDataMaxLendingLtvParams): OmniContentCardBase & OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    title: { key: 'ajna.content-card.max-lending-ltv.title' },
    value: formatDecimalAsPercent(maxLtv),
    ...(afterMaxLtv && {
      change: [formatDecimalAsPercent(afterMaxLtv)],
    }),
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('ajna.content-card.max-lending-ltv.title')}
        description={t('ajna.content-card.max-lending-ltv.modal-description')}
        value={formatDecimalAsPercent(maxLtv)}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
