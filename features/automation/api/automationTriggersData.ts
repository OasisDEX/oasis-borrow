import { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'
import { every5Seconds$ } from 'blockchain/network.constants'
import type { Context } from 'blockchain/network.types'
import type { NetworkIds } from 'blockchain/networks'
import { extractAutoBSData } from 'features/automation/common/state/autoBSTriggerData'
import { extractAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { type Observable, of } from 'rxjs'
import { distinctUntilChanged, map, mergeMap, shareReplay, withLatestFrom } from 'rxjs/operators'

import type { TriggersData } from './automationTriggersData.types'

async function loadTriggerDataFromSubgraph({
  positionId,
  chainId,
}: {
  positionId: number
  chainId: NetworkIds
}): Promise<TriggersData> {
  const { response } = (await loadSubgraph({
    subgraph: 'Discover',
    method: 'getMakerTriggersOld',
    networkId: chainId,
    params: {
      cdpId: positionId,
    },
  })) as SubgraphsResponses['Discover']['getMakerTriggersOld']

  // handling for cases where testing on fork
  // subgraph operates only on mainnet
  if (!response.cdps[0]) {
    return {
      isAutomationDataLoaded: true,
      isAutomationEnabled: false,
      triggers: [],
      chainId,
    }
  }

  // get only active triggers
  const triggers = response.cdps[0].triggers.filter(
    (trigger) => !trigger.removedBlock && !trigger.executedBlock,
  )

  return {
    isAutomationDataLoaded: true,
    isAutomationEnabled: triggers.length > 0,
    triggers: triggers.map((item) => ({
      ...item,
      triggerId: item.id,
      executionParams: item.triggerData,
    })),
    chainId,
  }
}

export function createAutomationTriggersData(
  context$: Observable<Context>,
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
    withLatestFrom(context$),
    mergeMap(([, context]) => {
      return loadTriggerDataFromSubgraph({
        positionId: id.toNumber(),
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
      autoTakeProfitData: extractAutoTakeProfitData(triggers),
    })),
  )
}
