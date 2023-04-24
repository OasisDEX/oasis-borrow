import { IPositionTransition, ISimplePositionTransition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { UserInput } from 'features/aave/common/BaseAaveContext'
import { allDefined } from 'helpers/allDefined'

import { zero } from './zero'

export function canOpenPosition({
  tokenBalance,
  userInput,
  effectiveProxyAddress,
  hasOpenedPosition,
  transition,
}: {
  userInput: UserInput
  hasOpenedPosition?: boolean
  tokenBalance?: BigNumber
  effectiveProxyAddress?: string
  transition?: IPositionTransition | ISimplePositionTransition
}) {
  return (
    allDefined(
      tokenBalance,
      userInput.amount,
      effectiveProxyAddress,
      !hasOpenedPosition,
      transition,
    ) &&
    tokenBalance!.gte(userInput.amount!) &&
    (userInput.debtAmount || zero).lte(
      transition!.simulation.position.maxDebtToBorrowWithCurrentCollateral,
    )
  )
}
