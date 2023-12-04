import type BigNumber from 'bignumber.js'
import { useAjnaRewards } from 'features/ajna/rewards/hooks'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { AjnaCardDataBorrowRateModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import { AjnaCardDataRewardsTooltip } from 'features/omni-kit/protocols/ajna/components/details-section/modals/AjnaCardDataRewardsTooltip'
import { isPoolWithRewards } from 'features/omni-kit/protocols/ajna/helpers'
import React from 'react'
import { sparks } from 'theme/icons'

interface AjnaCardDataBorrowRateParams {
  borrowRate: BigNumber
  collateralToken: string
  debtAmount: BigNumber
  isOwner: boolean
  owner: string
  quotePrice?: BigNumber
  quoteToken: string
}

export function useAjnaCardDataBorrowRate({
  borrowRate,
  collateralToken,
  debtAmount,
  isOwner,
  owner,
  quotePrice,
  quoteToken,
}: AjnaCardDataBorrowRateParams): OmniContentCardExtra {
  const {
    isLoading,
    rewards: { claimable, total },
  } = useAjnaRewards(owner)

  return {
    modal: <AjnaCardDataBorrowRateModal {...{ borrowRate, debtAmount, quoteToken, quotePrice }} />,
    ...(isPoolWithRewards({ collateralToken, quoteToken }) && {
      icon: sparks,
      tooltips: {
        icon: <AjnaCardDataRewardsTooltip {...{ isLoading, claimable, total, isOwner, owner }} />,
      },
    }),
  }
}
