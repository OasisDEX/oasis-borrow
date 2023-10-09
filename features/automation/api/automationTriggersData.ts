import { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { every5Seconds$ } from 'blockchain/network.constants'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { ProxiesRelatedWithPosition } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import type { PositionId } from 'features/aave/types/position-id'
import { getAllActiveTriggers } from 'features/automation/api/allActiveTriggers'
import { extractAutoBSData } from 'features/automation/common/state/autoBSTriggerData'
import { extractAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { extractConstantMultipleData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { GraphQLClient } from 'graphql-request'
import type { Observable } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, withLatestFrom } from 'rxjs/operators'

import type { TriggersData } from './automationTriggersData.types'

export async function loadTriggerDataFromCache({
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
