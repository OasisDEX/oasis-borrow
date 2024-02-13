import { Skeleton } from 'components/Skeleton'
import { useAjnaRewards } from 'features/ajna/rewards/hooks'
import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { AjnaCardDataTotalAjnaRewardsModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import React from 'react'

interface AjnaCardDataTotalAjnaRewardsParams {
  owner: string
  poolAddress: string
}

export function useAjnaCardDataTotalAjnaRewards({
  owner,
  poolAddress,
}: AjnaCardDataTotalAjnaRewardsParams): OmniContentCardBase & OmniContentCardExtra {
  const { isLoading, rewards } = useAjnaRewards(owner, poolAddress, OmniProductType.Earn)

  return {
    title: { key: 'ajna.content-card.total-ajna-rewards.title' },
    ...(isLoading
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: formatCryptoBalance(rewards.totalClaimableAndTotalCurrentPeriodEarned),
          unit: 'AJNA',
          modal: <AjnaCardDataTotalAjnaRewardsModal rewards={rewards} />,
        }),
  }
}
