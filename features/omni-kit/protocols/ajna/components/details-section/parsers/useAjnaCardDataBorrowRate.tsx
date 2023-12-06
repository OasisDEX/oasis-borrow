import type BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
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
  networkId: NetworkIds
  owner: string
  quotePrice?: BigNumber
  quoteToken: string
}

export function useAjnaCardDataBorrowRate({
  borrowRate,
  collateralToken,
  debtAmount,
  isOwner,
  networkId,
  owner,
  quotePrice,
  quoteToken,
}: AjnaCardDataBorrowRateParams): OmniContentCardExtra {
  const {
    isLoading,
    rewards: { claimable, total },
  } = useAjnaRewards(owner)

  return {
    modal: (
      <AjnaCardDataBorrowRateModal
        borrowRate={borrowRate}
        debtAmount={debtAmount}
        quoteToken={quoteToken}
        quotePrice={quotePrice}
      />
    ),
    ...(isPoolWithRewards({ collateralToken, networkId, quoteToken }) && {
      icon: sparks,
      tooltips: {
        icon: <AjnaCardDataRewardsTooltip {...{ isLoading, claimable, total, isOwner, owner }} />,
      },
    }),
  }
}
