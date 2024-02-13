import type { AjnaCommonDependencies, AjnaCommonPayload, AjnaPosition } from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { resolvePaybackAmount } from 'features/omni-kit/helpers'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
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
  lastEventInterestRate,
}: {
  state: Pick<OmniBorrowFormState, 'depositAmount' | 'generateAmount'>
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  lastEventInterestRate?: BigNumber
}) => {
  const { depositAmount, generateAmount } = state

  return strategies.ajna.borrow.depositBorrow(
    {
      ...commonPayload,
      collateralAmount: depositAmount || zero,
      position: position as AjnaPosition,
      quoteAmount: generateAmount || zero,
      stamploanEnabled: !!lastEventInterestRate?.gt(position.pool.interestRate),
    },
    dependencies,
  )
}

export const ajnaActionPaybackWithdrawBorrow = ({
  state,
  commonPayload,
  dependencies,
  position,
  quoteBalance,
  lastEventInterestRate,
}: {
  state: Pick<OmniBorrowFormState, 'withdrawAmount' | 'paybackAmount'>
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  quoteBalance: BigNumber
  lastEventInterestRate?: BigNumber
}) => {
  const { withdrawAmount, paybackAmount } = state

  const resolvedPaybackAmount = resolvePaybackAmount({ paybackAmount, quoteBalance })

  return strategies.ajna.borrow.paybackWithdraw(
    {
      ...commonPayload,
      collateralAmount: withdrawAmount || zero,
      position: position as AjnaPosition,
      quoteAmount: resolvedPaybackAmount,
      stamploanEnabled: !!lastEventInterestRate?.gt(position.pool.interestRate),
    },
    dependencies,
  )
}
