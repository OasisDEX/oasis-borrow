import {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaEarnPosition,
  strategies,
} from '@oasisdex/dma-library'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { AjnaGenericPosition } from 'features/ajna/common/types'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import { zero } from 'helpers/zero'

export const ajnaOpenEarn = ({
  state,
  commonPayload,
  dependencies,
  chainId,
}: {
  state: AjnaEarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  chainId: number
}) => {
  const { price, depositAmount, isStakingNft } = state

  return strategies.ajna.earn.open(
    {
      ...commonPayload,
      price: price!,
      quoteAmount: depositAmount!,
      isStakingNft: !!isStakingNft,
    },
    {
      ...dependencies,
      getEarnData: getAjnaEarnData,
      rewardsManagerAddress: getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaRewardsManager
        .address,
    },
  )
}

export const ajnaDepositEarn = ({
  state,
  commonPayload,
  dependencies,
  position,
}: {
  state: AjnaEarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { price, depositAmount, isStakingNft } = state

  return strategies.ajna.earn.depositAndAdjust(
    {
      ...commonPayload,
      price: price!,
      collateralAmount: zero,
      quoteAmount: depositAmount || zero,
      position: position as AjnaEarnPosition,
      isStakingNft: !!isStakingNft,
    },
    dependencies,
  )
}

export const ajnaWithdrawEarn = ({
  state,
  commonPayload,
  dependencies,
  position,
}: {
  state: AjnaEarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { price, withdrawAmount, isStakingNft } = state

  return strategies.ajna.earn.withdrawAndAdjust(
    {
      ...commonPayload,
      price: price!,
      collateralAmount: zero,
      quoteAmount: withdrawAmount || zero,
      position: position as AjnaEarnPosition,
      isStakingNft: !!isStakingNft,
    },
    dependencies,
  )
}

export const ajnaClaimEarn = ({
  state,
  commonPayload,
  dependencies,
  position,
}: {
  state: AjnaEarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { price, isStakingNft } = state

  return strategies.ajna.earn.claimCollateral(
    {
      ...commonPayload,
      price: price!,
      collateralAmount: zero,
      quoteAmount: zero,
      position: position as AjnaEarnPosition,
      isStakingNft: !!isStakingNft,
    },
    dependencies,
  )
}
