import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { notAvailable } from 'handlers/portfolio/constants'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

// interface AjnaCardDataProjectedAnnualRewardsParams {
//
// }

export function useAjnaCardDataProjectedAnnualRewards(): OmniContentCardBase &
  OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    title: { key: 'ajna.content-card.projected-annual-rewards.title' },
    value: notAvailable,
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('ajna.content-card.projected-annual-rewards.title')}
        description={t('ajna.content-card.projected-annual-rewards.modal-description')}
        value={notAvailable}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
