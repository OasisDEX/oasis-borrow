import type { GetTriggersResponse } from 'helpers/triggers'

type PartialTakeProfitTriggers = Pick<GetTriggersResponse['triggers'], 'aaveStopLossToCollateral'>

export const mapPartialTakeProfitFromLambda = (triggers?: PartialTakeProfitTriggers) => {
  if (!triggers) {
    return {}
  }
  return {}
}
