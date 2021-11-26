import BigNumber from 'bignumber.js'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { startWithDefault } from 'helpers/operators'
import { List } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { TriggersTypes } from '../common/enums/TriggersTypes'

export interface TriggerRecord {
  triggerId: number
  triggerType: number
  executionParams: string /* bytes triggerData  from TriggerAdded event*/
}

export interface TriggersData {
  isAutomationEnabled: boolean
  triggers: List<TriggerRecord> | undefined
}

export function createAutomationTriggersData(
  context$: Observable<ContextConnected>,
  onEveryBlock$: Observable<number>,
  vauit$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<TriggersData> {
  console.log('Building Observable<TriggersData> ')
  return onEveryBlock$.pipe(
    switchMap(() =>
      combineLatest(
        startWithDefault(onEveryBlock$, undefined),
        startWithDefault(vauit$(id /*,context.chainId*/), undefined),
      ).pipe(
        map(([blockNumber, vault]) => {
          console.log(blockNumber, vault?.id)
          const trigerData: TriggersData = {
            isAutomationEnabled: true,
            triggers: generateMock(),
          }
          return trigerData
        }),
        distinctUntilChanged((s1, s2) => {
          return JSON.stringify(s1) === JSON.stringify(s2)
        }),
        shareReplay(1),
      ),
    ),
  )
}
function generateMock(): List<TriggerRecord> {
  /* TODO: replace with actual Event reading when ready and in final version with fetching from cache */
  return [
    {
      triggerId: 1,
      triggerType: TriggersTypes.StopLossToCollateral,
      executionParams: '0x1234',
    } as TriggerRecord,
  ] as List<TriggerRecord>
}
