import BigNumber from 'bignumber.js'
import { last } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { TriggersTypes } from '../common/enums/TriggersTypes'
import { TriggerRecord, TriggersData } from './AutomationTriggersData'

function getSLLevel(rawBytes: string): BigNumber {
  /* TODO: Some event data parsing here in a future */
  rawBytes.length
  return new BigNumber(1.95)
}

export interface StopLossTriggerData {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  isToCollateral: boolean
}

export function createStopLossTriggersData(
  triggersData$: Observable<TriggersData>,
): Observable<StopLossTriggerData> {
  console.log('Building Observable<StopLossTriggerData>')
  return triggersData$.pipe(
    map((data) => {
      const doesStopLossExist = data.triggers ? data.triggers.length > 0 : false
      if (doesStopLossExist) {
        const slRecord: TriggerRecord | undefined = data.triggers ? last(data.triggers) : undefined
        if (!slRecord)
          throw data /* TODO: This is logically unreachable, revrite so typecheck works */
        return {
          isStopLossEnabled: true,
          stopLossLevel: getSLLevel(slRecord.executionParams),
          isToCollateral: slRecord.triggerType === TriggersTypes.StopLossToCollateral,
        } as StopLossTriggerData
      } else {
        return {
          isStopLossEnabled: false,
          stopLossLevel: new BigNumber(0),
        } as StopLossTriggerData
      }
    }),
  )
}
