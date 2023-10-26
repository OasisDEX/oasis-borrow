import type {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaEarnPosition,
} from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn'
import { zero } from 'helpers/zero'

export const ajnaActionOpenEarn = ({
  state,
  commonPayload,
  dependencies,
  chainId,
  price,
}: {
  state: OmniEarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  chainId: number
  price?: BigNumber
}) => {
  const { depositAmount } = state

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

export const ajnaActionDepositEarn = ({
  state,
  commonPayload,
  dependencies,
  position,
  price,
}: {
  state: OmniEarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  price?: BigNumber
}) => {
  const { depositAmount } = state

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

export const ajnaActionWithdrawEarn = ({
  state,
  commonPayload,
  dependencies,
  position,
  price,
}: {
  state: OmniEarnFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  price?: BigNumber
}) => {
  const { withdrawAmount } = state

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

export const ajnaOmniClaimEarn = ({
  commonPayload,
  dependencies,
  position,
  price,
}: {
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  price?: BigNumber
}) => {
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
