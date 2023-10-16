import type {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaEarnPosition,
} from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import type { EarnFormState } from 'features/ajna/positions/earn/state/earnFormReducto.types'
import { zero } from 'helpers/zero'

export const ajnaOpenEarn = ({
  state,
  commonPayload,
  dependencies,
  chainId,
}: {
  state: EarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  chainId: number
}) => {
  const { price, depositAmount } = state

  return strategies.ajna.earn.open(
    {
      ...commonPayload,
      price: price!,
      quoteAmount: depositAmount!,
    },
    {
      ...dependencies,
      getEarnData: getAjnaEarnData(chainId),
    },
  )
}

export const ajnaDepositEarn = ({
  state,
  commonPayload,
  dependencies,
  position,
}: {
  state: EarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { price, depositAmount } = state

  return strategies.ajna.earn.depositAndAdjust(
    {
      ...commonPayload,
      price: price!,
      collateralAmount: zero,
      quoteAmount: depositAmount || zero,
      position: position as AjnaEarnPosition,
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
  state: EarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { price, withdrawAmount } = state

  return strategies.ajna.earn.withdrawAndAdjust(
    {
      ...commonPayload,
      price: price!,
      collateralAmount: zero,
      quoteAmount: withdrawAmount || zero,
      position: position as AjnaEarnPosition,
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
  state: EarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { price } = state

  return strategies.ajna.earn.claimCollateral(
    {
      ...commonPayload,
      price: price!,
      collateralAmount: zero,
      quoteAmount: zero,
      position: position as AjnaEarnPosition,
    },
    dependencies,
  )
}
