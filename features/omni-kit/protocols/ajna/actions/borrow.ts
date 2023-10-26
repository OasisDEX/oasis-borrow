import type { AjnaCommonDependencies, AjnaCommonPayload, AjnaPosition } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import { zero } from 'helpers/zero'

export const ajnaActionOpenBorrow = ({
  state,
  commonPayload,
  dependencies,
}: {
  state: OmniBorrowFormState
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

export const ajnaActionDepositGenerateBorrow = ({
  state,
  commonPayload,
  dependencies,
  position,
  simulation,
}: {
  state: Pick<OmniBorrowFormState, 'depositAmount' | 'generateAmount'>
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  simulation?: AjnaGenericPosition
}) => {
  const { depositAmount, generateAmount } = state

  const borrowishPosition = position as AjnaPosition
  const borrowishSimulation = simulation as AjnaPosition | undefined

  return strategies.ajna.borrow.depositBorrow(
    {
      ...commonPayload,
      collateralAmount: depositAmount || zero,
      position: position as AjnaPosition,
      quoteAmount: generateAmount || zero,
      stamploanEnabled: !!borrowishSimulation?.liquidationPrice.lt(
        borrowishPosition.liquidationPrice,
      ),
    },
    dependencies,
  )
}

export const ajnaActionPaybackWithdrawBorrow = ({
  state,
  commonPayload,
  dependencies,
  position,
  simulation,
}: {
  state: Pick<OmniBorrowFormState, 'withdrawAmount' | 'paybackAmount'>
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  simulation?: AjnaGenericPosition
}) => {
  const { withdrawAmount, paybackAmount } = state

  const borrowishPosition = position as AjnaPosition
  const borrowishSimulation = simulation as AjnaPosition | undefined

  return strategies.ajna.borrow.paybackWithdraw(
    {
      ...commonPayload,
      collateralAmount: withdrawAmount || zero,
      position: position as AjnaPosition,
      quoteAmount: paybackAmount || zero,
      stamploanEnabled: !!borrowishSimulation?.liquidationPrice.lt(
        borrowishPosition.liquidationPrice,
      ),
    },
    dependencies,
  )
}
