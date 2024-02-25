import { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { every5Seconds$ } from 'blockchain/network.constants'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { AddressesRelatedWithPosition } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import type { PositionId } from 'features/aave/types/position-id'
import { getAllActiveTriggers } from 'features/automation/api/allActiveTriggers'
import { extractAutoBSData } from 'features/automation/common/state/autoBSTriggerData'
import { extractAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { extractConstantMultipleData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { GraphQLClient } from 'graphql-request'
import { type Observable, of } from 'rxjs'
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
  proxiesRelatedWithPosition$: (
    positionId: PositionId,
    networkId: NetworkIds,
  ) => Observable<AddressesRelatedWithPosition>,
  id: BigNumber,
  networkId: NetworkIds,
): Observable<TriggersData> {
  if (id.isNaN()) {
    // this is called on DS proxy and vault id (id) isnt a number (its an address)
    // and we dont support automation on Aave V2 + DS proxy
    return of({
      isAutomationDataLoaded: false,
      isAutomationEnabled: false,
      chainId: networkId,
    })
  }
  return every5Seconds$.pipe(
    withLatestFrom(context$, proxiesRelatedWithPosition$({ vaultId: id.toNumber() }, networkId)),
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
  automationTriggersData$: (id: BigNumber, networkId: NetworkIds) => Observable<TriggersData>,
  id: BigNumber,
  networkId: NetworkIds,
) {
  return automationTriggersData$(id, networkId).pipe(
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
