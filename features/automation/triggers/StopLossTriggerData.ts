import BigNumber from 'bignumber.js'
import _ from 'lodash'
import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

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
    filter((data) => {
      console.log('Processing triggersData$', data)
      const validElements = _.filter(
        data.triggers,
        (x) =>
          x.triggerType === TriggersTypes.StopLossToCollateral ||
          x.triggerType === TriggersTypes.StopLossToDai,
      )
      return validElements.length > 0
    }),
    map((data) => {
      const doesStopLossExist = data.triggers ? data.triggers.length > 0 : false
      if (doesStopLossExist) {
        const slRecord: TriggerRecord | undefined = data.triggers
          ? _.last(data.triggers)
          : undefined
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
