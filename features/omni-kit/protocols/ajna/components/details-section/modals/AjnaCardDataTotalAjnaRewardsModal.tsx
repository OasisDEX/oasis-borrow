import { RewardsModal } from 'components/rewards'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { ajna_circle_color } from 'theme/icons'

interface AjnaCardDataTotalAjnaRewardsModalProps {
  rewards: AjnaRewards
}

export function AjnaCardDataTotalAjnaRewardsModal({
  rewards: {
    claimable,
    currentPeriodTotalEarned,
    totalEarnedToDate,
    totalClaimableAndTotalCurrentPeriodEarned,
    currentPeriodPositionEarned,
    ajnaPrice,
  },
}: AjnaCardDataTotalAjnaRewardsModalProps) {
  return (
    <RewardsModal
      gradient={['#f154db', '#974eea']}
      unit="AJNA"
      tokenIcon={ajna_circle_color}
      link={INTERNAL_LINKS.ajnaRewards}
      rewards={{
        totalClaimableAndTotalCurrentPeriodEarned,
        totalClaimableAndTotalCurrentPeriodEarnedUsd:
          totalClaimableAndTotalCurrentPeriodEarned.times(ajnaPrice),
        claimable: claimable,
        currentPeriodTotalEarned,
        currentPeriodPositionEarned,
        totalEarnedToDate,
      }}
      btnAsLink
    />
  )
}
