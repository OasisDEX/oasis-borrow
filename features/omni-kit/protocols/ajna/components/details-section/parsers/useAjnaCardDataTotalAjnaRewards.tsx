import { Skeleton } from 'components/Skeleton'
import { useAjnaRewards } from 'features/ajna/rewards/hooks'
import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { AjnaCardDataTotalAjnaRewardsModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import React from 'react'

interface AjnaCardDataTotalAjnaRewardsParams {
  owner: string
}

export function useAjnaCardDataTotalAjnaRewards({
  owner,
}: AjnaCardDataTotalAjnaRewardsParams): OmniContentCardBase & OmniContentCardExtra {
  const {
    isLoading,
    rewards: { bonus, claimable, total },
  } = useAjnaRewards(owner)

  return {
    title: { key: 'ajna.content-card.total-ajna-rewards.title' },
    ...(isLoading
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: formatCryptoBalance(total),
          unit: '$AJNA',
          modal: (
            <AjnaCardDataTotalAjnaRewardsModal
              bonus={bonus}
              claimable={claimable}
              isLoading={isLoading}
              total={total}
            />
          ),
        }),
  }
}
