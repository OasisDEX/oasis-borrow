import BigNumber from 'bignumber.js'
import { UserInput } from 'features/aave/common/BaseAaveContext'
import { allDefined } from 'helpers/allDefined'

export function canOpenPosition({
  userInput,
  hasOpenedPosition,
  tokenBalance,
  effectiveProxyAddress,
}: {
  userInput: UserInput
  hasOpenedPosition?: boolean
  tokenBalance?: BigNumber
  effectiveProxyAddress?: string
}) {
  return (
    allDefined(tokenBalance, userInput.amount, effectiveProxyAddress, !hasOpenedPosition) &&
    tokenBalance!.gte(userInput.amount!)
  )
}
