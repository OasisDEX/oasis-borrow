import BigNumber from 'bignumber.js'
import { trailingStopLossDenomination } from 'features/aave/constants'
import type { GetTriggersResponse } from 'helpers/triggers'

type TrailingStopLossTriggers = Pick<GetTriggersResponse['triggers'], 'aaveTrailingStopLossDMA'>

export const mapTrailingStopLossFromLambda = (triggers?: TrailingStopLossTriggers) => {
  if (!triggers) {
    return {}
  }
  const trailingStopLossTriggersNames = Object.keys(triggers).filter((triggerName) =>
    triggerName.includes('TrailingStopLoss'),
  )
  if (trailingStopLossTriggersNames.length > 1) {
    console.warn(
      'Warning: more than one trailing stop loss trigger found:',
      trailingStopLossTriggersNames,
    )
  }
  const trailingStopLossTriggerName =
    trailingStopLossTriggersNames[0] as keyof TrailingStopLossTriggers
  const trigger = triggers[trailingStopLossTriggerName]
  if (trigger) {
    const trailingDistance = trigger.decodedParams.trailingDistance
    return {
      trailingDistance: new BigNumber(Number(trailingDistance)).div(trailingStopLossDenomination),
      trailingStopLossToken: trailingStopLossTriggerName.includes('Debt')
        ? ('debt' as const)
        : ('collateral' as const),
      trailingStopLossData: trigger,
      trailingStopLossTriggerName,
    }
  }
  return {}
}
