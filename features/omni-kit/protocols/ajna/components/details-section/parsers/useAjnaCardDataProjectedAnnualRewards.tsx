import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { Skeleton } from 'components/Skeleton'
import { useAjnaRewards } from 'features/ajna/rewards/hooks'
import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataProjectedAnnualRewardsParams {
  owner: string
  poolAddress: string
  netValueUsd: BigNumber
}

export function useAjnaCardDataProjectedAnnualRewards({
  owner,
  poolAddress,
  netValueUsd,
}: AjnaCardDataProjectedAnnualRewardsParams): OmniContentCardBase & OmniContentCardExtra {
  const { t } = useTranslation()
  const { isLoading, rewards } = useAjnaRewards(owner, poolAddress, OmniProductType.Earn)

  const annualRewards = normalizeValue(rewards.lastDayRewardsUsd.div(netValueUsd).times(365))
  const formattedValue = formatDecimalAsPercent(annualRewards)

  return {
    title: { key: 'ajna.content-card.projected-annual-rewards.title' },
    ...(isLoading
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: formattedValue,
          modal: (
            <DetailsSectionContentSimpleModal
              title={t('ajna.content-card.projected-annual-rewards.title')}
              description={t('ajna.content-card.projected-annual-rewards.modal-description')}
              value={formattedValue}
              theme={ajnaExtensionTheme}
            />
          ),
        }),
  }
}
