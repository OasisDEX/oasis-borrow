import { TriggerType } from '@oasisdex/automation'
import { getNetworkId } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { Context, every5Seconds$ } from 'blockchain/network'
import { ProxiesRelatedWithPosition } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import { PositionId } from 'features/aave/types'
import { getAllActiveTriggers } from 'features/automation/api/allActiveTriggers'
import {
  AutoBSTriggerData,
  extractAutoBSData,
} from 'features/automation/common/state/autoBSTriggerData'
import {
  AutoTakeProfitTriggerData,
  extractAutoTakeProfitData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import {
  ConstantMultipleTriggerData,
  extractConstantMultipleData,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import {
  extractStopLossData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { GraphQLClient } from 'graphql-request'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, withLatestFrom } from 'rxjs/operators'

// TODO - ŁW - Implement tests for this file

async function loadTriggerDataFromCache({
  positionId,
  proxyAddress,
  cacheApi,
}: {
  positionId: number
  cacheApi: string
  proxyAddress?: string
}): Promise<TriggersData> {
  const activeTriggersForVault = await getAllActiveTriggers(
    new GraphQLClient(cacheApi),
    positionId.toString(),
    proxyAddress,
  )

  return {
    isAutomationEnabled: activeTriggersForVault.length > 0,
    triggers: activeTriggersForVault,
  }
}

export interface TriggerRecord {
  triggerId: number
  groupId?: number
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
  proxiesRelatedWithPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  id: BigNumber,
): Observable<TriggersData> {
  return every5Seconds$.pipe(
    withLatestFrom(context$, proxiesRelatedWithPosition$({ vaultId: id.toNumber() })),
    mergeMap(([, , proxies]) => {
      const networkId = getNetworkId()
      const networkConfig = networksById[networkId]

      return loadTriggerDataFromCache({
        positionId: id.toNumber(),
        proxyAddress: proxies.dpmProxy?.proxy,
        cacheApi: networkConfig.cacheApi,
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
