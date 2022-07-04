import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { Context, every5Seconds$ } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import {
  BasicBSTriggerData,
  extractBasicBSData,
} from 'features/automation/common/basicBSTriggerData'
import {
  extractStopLossData,
  StopLossTriggerData,
} from 'features/automation/protection/common/stopLossTriggerData'
import { GraphQLClient } from 'graphql-request'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, withLatestFrom } from 'rxjs/operators'

import { getAllActiveTriggers } from '../common/service/allActiveTriggers'

// TODO - ŁW - Implement tests for this file

async function loadTriggerDataFromCache(vaultId: number, cacheApi: string): Promise<TriggersData> {
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
  triggers?: TriggerRecord[]
}

export function createAutomationTriggersData(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<TriggersData> {
  return every5Seconds$.pipe(
    withLatestFrom(context$, vault$(id)),
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

export function createAutomationTriggersChange$(
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>,
  id: BigNumber,
) {
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  return stopLossReadEnabled
    ? automationTriggersData$(id).pipe(
        map((triggers) => ({
          kind: 'automationTriggersData',
          stopLossData: extractStopLossData(triggers),
          basicSellData: extractBasicBSData(triggers, TriggerType.BasicSell),
          basicBuyData: extractBasicBSData(triggers, TriggerType.BasicBuy),
        })),
      )
    : []
}

export interface AutomationTriggersChange {
  kind: 'automationTriggersData'
  stopLossData: StopLossTriggerData
  basicSellData: BasicBSTriggerData
  basicBuyData: BasicBSTriggerData
}
