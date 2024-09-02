import type {
  MorphoBlueCommonDependencies,
  MorphoblueDepositBorrowPayload,
} from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { resolvePaybackAmount } from 'features/omni-kit/helpers'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import { zero } from 'helpers/zero'

export const makerActionOpenBorrow = ({
  state,
  commonPayload,
  dependencies,
}: {
  state: OmniBorrowFormState
  commonPayload: MorphoblueDepositBorrowPayload
  dependencies: MorphoBlueCommonDependencies
}) => {
  const { depositAmount, generateAmount } = state

  return strategies.morphoblue.borrow.openDepositBorrow(
    {
      ...commonPayload,
      collateralAmount: depositAmount || zero,
      quoteAmount: generateAmount || zero,
    },
    dependencies,
  )
}

export const makerActionDepositBorrow = ({
  state,
  commonPayload,
  dependencies,
}: {
  state: Pick<OmniBorrowFormState, 'depositAmount' | 'generateAmount'>
  commonPayload: MorphoblueDepositBorrowPayload
  dependencies: MorphoBlueCommonDependencies
}) => {
  const { depositAmount, generateAmount } = state
  return strategies.morphoblue.borrow.depositBorrow(
    {
      ...commonPayload,
      collateralAmount: depositAmount || zero,
      quoteAmount: generateAmount || zero,
    },
    dependencies,
  )
}

export const makerActionPaybackWithdraw = ({
  state,
  commonPayload,
  dependencies,
  quoteBalance,
}: {
  state: Pick<OmniBorrowFormState, 'withdrawAmount' | 'paybackAmount'>
  commonPayload: MorphoblueDepositBorrowPayload
  dependencies: MorphoBlueCommonDependencies
  quoteBalance: BigNumber
}) => {
  const { withdrawAmount, paybackAmount } = state

  const resolvedPaybackAmount = resolvePaybackAmount({ paybackAmount, quoteBalance })

  return strategies.morphoblue.borrow.paybackWithdraw(
    {
      ...commonPayload,
      collateralAmount: withdrawAmount || zero,
      quoteAmount: resolvedPaybackAmount,
    },
    dependencies,
  )
}
