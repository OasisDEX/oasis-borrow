import {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaPosition,
  strategies,
} from '@oasisdex/dma-library'
import { AjnaGenericPosition } from 'features/ajna/common/types'
import { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { one, zero } from 'helpers/zero'

export const ajnaOpenBorrow = ({
  state,
  commonPayload,
  dependencies,
}: {
  state: AjnaBorrowFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
}) => {
  const { depositAmount, generateAmount } = state

  return strategies.ajna.borrow.open(
    {
      ...commonPayload,
      collateralAmount: depositAmount!,
      quoteAmount: generateAmount || zero,
    },
    dependencies,
  )
}

export const ajnaDepositGenerateBorrow = ({
  state,
  commonPayload,
  dependencies,
  position,
}: {
  state: Pick<AjnaBorrowFormState, 'depositAmount' | 'generateAmount'>
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { depositAmount, generateAmount } = state

  return strategies.ajna.borrow.depositBorrow(
    {
      ...commonPayload,
      collateralAmount: depositAmount || zero,
      position: position as AjnaPosition,
      quoteAmount: generateAmount || zero,
    },
    dependencies,
  )
}

export const ajnaPaybackWithdrawBorrow = ({
  state,
  commonPayload,
  dependencies,
  position,
}: {
  state: Pick<AjnaBorrowFormState, 'withdrawAmount' | 'paybackAmount'>
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  const { withdrawAmount, paybackAmount } = state

  console.log(`paybackAmount: ${paybackAmount}`)

  // TODO temporary fix in order to force refresh of neutral price
  //  and therefore liquidation price on repay-only action
  const resolvedWithdrawFallback =
    !withdrawAmount?.gt(zero) && paybackAmount?.gt(zero)
      ? one.shiftedBy(-commonPayload.collateralTokenPrecision)
      : zero

  return strategies.ajna.borrow.paybackWithdraw(
    {
      ...commonPayload,
      collateralAmount: withdrawAmount || resolvedWithdrawFallback,
      position: position as AjnaPosition,
      quoteAmount: paybackAmount || zero,
    },
    dependencies,
  )
}
