import type BigNumber from 'bignumber.js'
import { useAjnaRewards } from 'features/ajna/rewards/hooks'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { AjnaCardDataBorrowRateModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import { AjnaCardDataRewardsTooltip } from 'features/omni-kit/protocols/ajna/components/details-section/modals/AjnaCardDataRewardsTooltip'
import { isPoolWithRewards } from 'features/omni-kit/protocols/ajna/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'
import { sparks } from 'theme/icons'

interface AjnaCardDataBorrowRateParams {
  borrowRate: BigNumber
  collateralToken: string
  debtAmount: BigNumber
  isOwner: boolean
  networkId: OmniSupportedNetworkIds
  owner: string
  quoteToken: string
  poolAddress: string
}

export function useAjnaCardDataBorrowRate({
  borrowRate,
  collateralToken,
  debtAmount,
  isOwner,
  networkId,
  owner,
  quoteToken,
  poolAddress,
}: AjnaCardDataBorrowRateParams): OmniContentCardExtra {
  const { isLoading, rewards } = useAjnaRewards(owner, poolAddress, OmniProductType.Borrow)

  return {
    modal: (
      <AjnaCardDataBorrowRateModal
        borrowRate={borrowRate}
        debtAmount={debtAmount}
        quoteToken={quoteToken}
      />
    ),
    ...(isPoolWithRewards({ collateralToken, networkId, quoteToken }) && {
      icon: sparks,
      tooltips: {
        icon: <AjnaCardDataRewardsTooltip {...{ isLoading, rewards, isOwner, owner }} />,
      },
      customTooltipWidth: ['300px', '400px'],
    }),
  }
}
