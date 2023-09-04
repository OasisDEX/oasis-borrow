import {
  IPositionTransitionParams,
  ISimplePositionTransition,
  IStrategy,
} from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { UserInput } from 'features/aave/types'
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
  transition?: ISimplePositionTransition | IPositionTransitionParams | IStrategy
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
