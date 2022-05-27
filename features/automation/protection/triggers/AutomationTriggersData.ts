import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { Context, every5Seconds$ } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { GraphQLClient } from 'graphql-request'
import { List } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, withLatestFrom } from 'rxjs/operators'

import { useFeatureToggle } from '../../../../helpers/useFeatureToggle'
import { getAllActiveTriggers } from '../common/service/allActiveTriggers'
import { extractStopLossData, StopLossTriggerData } from '../common/StopLossTriggerDataExtractor'

// TODO - ŁW - Implement tests for this file

async function loadTriggerDataFromCache(vaultId: number, cacheApi: string): Promise<TriggersData> {
  // TODO: ŁW what's wrong with GraphQLClient
  const activeTriggersForVault = await getAllActiveTriggers(
    new GraphQLClient(cacheApi),
    vaultId.toFixed(0),
  )

  return {
    isAutomationEnabled: activeTriggersForVault.length > 0,
    triggers: activeTriggersForVault,
  }
}

export interface TriggerRecord {
  triggerId: number
  commandAddress: string
  executionParams: string // bytes triggerData from TriggerAdded event
}

export interface TriggersData {
  isAutomationEnabled: boolean
  triggers?: List<TriggerRecord>
}

export function createAutomationTriggersData(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  vauit$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<TriggersData> {
  return every5Seconds$.pipe(
    withLatestFrom(context$, vauit$(id)),
    mergeMap(([, , vault]) => {
      const networkConfig = networksById[vault.chainId]
      return loadTriggerDataFromCache(vault.id.toNumber(), networkConfig.cacheApi)
    }),
    distinctUntilChanged((s1, s2) => {
      return JSON.stringify(s1) === JSON.stringify(s2)
    }),
    shareReplay(1),
  )
}

export function createStopLossDataChange$(
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>,
  id: BigNumber,
) {
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  return stopLossReadEnabled
    ? automationTriggersData$(id).pipe(
        map((triggers) => ({
          kind: 'stopLossData',
          stopLossData: extractStopLossData(triggers),
        })),
      )
    : []
}

export interface StopLossChange {
  kind: 'stopLossData'
  stopLossData: StopLossTriggerData
}
