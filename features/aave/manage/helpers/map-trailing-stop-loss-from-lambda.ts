import BigNumber from 'bignumber.js'
import { lambdaPriceDenomination } from 'features/aave/constants'
import type { GetTriggersResponse } from 'helpers/triggers'

type TrailingStopLossTriggers = Pick<
  GetTriggersResponse['triggers'],
  'aaveTrailingStopLossDMA' | 'sparkTrailingStopLossDMA'
>

const denominate = (value: string) => new BigNumber(Number(value)).div(lambdaPriceDenomination)

export const mapTrailingStopLossFromLambda = (triggers?: TrailingStopLossTriggers) => {
  if (!triggers) {
    return {}
  }
  const trailingStopLossTriggersNames = Object.keys(triggers).filter((triggerName) =>
    triggerName.includes('TrailingStopLoss'),
  )
  if (trailingStopLossTriggersNames.length > 1) {
    console.warn(
      'Warning: more than one trailing Stop-Loss trigger found:',
      trailingStopLossTriggersNames,
    )
  }
  const trailingStopLossTriggerName =
    trailingStopLossTriggersNames[0] as keyof TrailingStopLossTriggers
  const trigger = triggers[trailingStopLossTriggerName]
  if (trigger) {
    return {
      trailingDistance: denominate(trigger.decodedParams.trailingDistance),
      trailingStopLossToken: trigger.decodedParams.closeToCollateral
        ? ('collateral' as const)
        : ('debt' as const),
      trailingStopLossData: trigger,
      triggerId: trigger.triggerId,
      dynamicParams: {
        executionPrice: denominate(trigger.dynamicParams.executionPrice),
        originalExecutionPrice: denominate(trigger.dynamicParams.originalExecutionPrice),
      },
      trailingStopLossTriggerName,
    }
  }
  return {}
}
