import type { AjnaCommonDependencies, AjnaCommonPayload, AjnaEarnPosition } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import type { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto.types'
import { zero } from 'helpers/zero'

export const ajnaOmniOpenEarn = ({
  state,
  commonPayload,
  dependencies,
  chainId,
  price,
}: {
  state: AjnaEarnFormState
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

export const ajnaOmniDepositEarn = ({
  state,
  commonPayload,
  dependencies,
  position,
  price,
}: {
  state: AjnaEarnFormState
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

export const ajnaOmniWithdrawEarn = ({
  state,
  commonPayload,
  dependencies,
  position,
  price,
}: {
  state: AjnaEarnFormState
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
