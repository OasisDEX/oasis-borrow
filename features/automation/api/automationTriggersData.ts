import { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network';
import { every5Seconds$ } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import type { ProxiesRelatedWithPosition } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import type { PositionId } from 'features/aave/types/position-id'
import { getAllActiveTriggers } from 'features/automation/api/allActiveTriggers'
import type {
  AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData';
import {
  extractAutoBSData,
} from 'features/automation/common/state/autoBSTriggerData'
import type {
  AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData';
import {
  extractAutoTakeProfitData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import type {
  ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData';
import {
  extractConstantMultipleData,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import type {
  StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData';
import {
  extractStopLossData
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { GraphQLClient } from 'graphql-request'
import type { Observable } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, withLatestFrom } from 'rxjs/operators'

async function loadTriggerDataFromCache({
  positionId,
  proxyAddress,
  cacheApi,
  chainId,
}: {
  positionId: number
  cacheApi: string
  proxyAddress?: string
  chainId: NetworkIds
}): Promise<TriggersData> {
  const activeTriggersForVault = await getAllActiveTriggers(
    new GraphQLClient(cacheApi),
    positionId.toString(),
    proxyAddress,
  )

  return {
    isAutomationDataLoaded: true,
    isAutomationEnabled: activeTriggersForVault.length > 0,
    triggers: activeTriggersForVault,
    chainId,
  }
}

export interface TriggerRecord {
  triggerId: number
  groupId?: number
  commandAddress: string
  executionParams: string // bytes triggerData from TriggerAdded event
}

export interface TriggersData {
  isAutomationDataLoaded: boolean
  isAutomationEnabled: boolean
  chainId: NetworkIds
  triggers?: TriggerRecord[]
}

export function createAutomationTriggersData(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  proxiesRelatedWithPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  id: BigNumber,
): Observable<TriggersData> {
  return every5Seconds$.pipe(
    withLatestFrom(context$, proxiesRelatedWithPosition$({ vaultId: id.toNumber() })),
    mergeMap(([, context, proxies]) => {
      return loadTriggerDataFromCache({
        positionId: id.toNumber(),
        proxyAddress: proxies.dpmProxy?.proxy,
        cacheApi: getNetworkContracts(NetworkIds.MAINNET, context.chainId).cacheApi,
        chainId: context.chainId,
      })
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
  return automationTriggersData$(id).pipe(
    map((triggers) => ({
      kind: 'automationTriggersData',
      stopLossData: extractStopLossData(triggers),
      autoSellData: extractAutoBSData({
        triggersData: triggers,
        triggerType: TriggerType.BasicSell,
      }),
      autoBuyData: extractAutoBSData({
        triggersData: triggers,
        triggerType: TriggerType.BasicBuy,
      }),
      constantMultipleData: extractConstantMultipleData(triggers),
      autoTakeProfitData: extractAutoTakeProfitData(triggers),
    })),
  )
}

export interface AutomationTriggersChange {
  kind: 'automationTriggersData'
  stopLossData: StopLossTriggerData
  autoSellData: AutoBSTriggerData
  autoBuyData: AutoBSTriggerData
  constantMultipleData: ConstantMultipleTriggerData
  autoTakeProfitData: AutoTakeProfitTriggerData
}
