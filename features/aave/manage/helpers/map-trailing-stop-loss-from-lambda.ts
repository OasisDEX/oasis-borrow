import BigNumber from 'bignumber.js'
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
    const trailingDistance = trigger.decodedParams.trailingDistance || trigger.decodedParams
    return {
      trailingDistance: trailingDistance
        ? new BigNumber(Number(trailingDistance)).div(10 ** 2)
        : undefined,
      trailingStopLossToken: trailingStopLossTriggerName.includes('Debt')
        ? ('debt' as const)
        : ('collateral' as const),
      trailingStopLossData: trigger,
      trailingStopLossTriggerName,
    }
  }
  return {}
}
