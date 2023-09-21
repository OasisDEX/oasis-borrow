import { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { VaultWithType, VaultWithValue } from 'blockchain/vaults.types'
import { extractAutoBSData } from 'features/automation/common/state/autoBSTriggerData'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { gql, GraphQLClient } from 'graphql-request'
import { isEqual, memoize } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, from, timer } from 'rxjs'
import { distinctUntilChanged, shareReplay } from 'rxjs/internal/operators'
import { map, switchMap } from 'rxjs/operators'

import { fetchWithOperationId, flatEvents } from './vaultHistory'
import type { CacheResult, VaultWithHistory } from './vaultsHistory.types'

const query = gql`
  query vaultsMultiplyHistories($urns: [String!], $cdpIds: [BigFloat!]) {
    allVaultMultiplyHistories(
      filter: { urn: { in: $urns } }
      orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        kind
        hash
        timestamp
        id
        transferFrom
        transferTo
        collateralAmount
        daiAmount
        vaultCreator
        cdpId
        txId
        blockId
        rate
        urn
      }
    }

    allTriggerEvents(
      filter: { cdpId: { in: $cdpIds } }
      orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        id
        triggerId
        cdpId
        hash
        number
        timestamp
        eventType
        kind
        commandAddress
        groupId
        groupType
        gasFee
        ethPrice
      }
    }

    allActiveTriggers(filter: { cdpId: { in: $cdpIds } }, orderBy: [BLOCK_ID_ASC]) {
      nodes {
        cdpId
        triggerId
        commandAddress
        triggerData
      }
    }
  }
`

async function getDataFromCache(
  client: GraphQLClient,
  urns: string[],
  cdpIds: BigNumber[],
): Promise<CacheResult> {
  const data = await client.request(query, {
    urns,
    cdpIds: cdpIds.map((id) => id.toNumber()),
  })

  return {
    events: data.allVaultMultiplyHistories.nodes,
    automationEvents: data.allTriggerEvents.nodes,
    activeTriggers: data.allActiveTriggers.nodes,
  }
}

function mapToVaultWithHistory(
  vaults: VaultWithValue<VaultWithType>[],
  { events, automationEvents, activeTriggers }: CacheResult,
  chainId: NetworkIds,
): VaultWithHistory[] {
  return vaults.map((vault) => {
    const vaultEvents = events.filter((event) => event.urn === vault.address)
    const vaultAutomationEvents = automationEvents.filter(
      (event) => event.cdpId === vault.id.toString(),
    )
    const vaultActiveTriggers = activeTriggers.filter(
      (trigger) => trigger.cdpId === vault.id.toString(),
    )
    const isAutomationEnabled = vaultActiveTriggers.length > 0
    const triggers = vaultActiveTriggers.map((trigger) => ({
      ...trigger,
      executionParams: trigger.triggerData,
    }))

    const history = flatEvents([vaultEvents, vaultAutomationEvents])
    const stopLossData = extractStopLossData({
      isAutomationDataLoaded: true,
      isAutomationEnabled,
      triggers,
      chainId,
    })
    const autoSellData = extractAutoBSData({
      triggersData: {
        isAutomationDataLoaded: true,
        isAutomationEnabled,
        triggers,
        chainId,
      },
      triggerType: TriggerType.BasicSell,
    })

    return {
      ...vault,
      history,
      stopLossData,
      autoSellData,
    }
  })
}

export function vaultsWithHistory$(
  context$: Observable<Context>,
  vaults$: (address: string) => Observable<VaultWithValue<VaultWithType>[]>,
  refreshInterval: number,
  address: string,
): Observable<VaultWithHistory[]> {
  const makeClient = memoize(
    (url: string) => new GraphQLClient(url, { fetch: fetchWithOperationId }),
  )
  return timer(0, refreshInterval).pipe(
    switchMap(() => combineLatest(context$, vaults$(address))),
    distinctUntilChanged(isEqual),
    switchMap(([{ chainId }, vaults]: [Context, VaultWithValue<VaultWithType>[]]) => {
      const apiClient = makeClient(getNetworkContracts(NetworkIds.MAINNET, chainId).cacheApi)
      return from(
        getDataFromCache(
          apiClient,
          vaults.map((vault) => vault.address.toLowerCase()),
          vaults.map((vault) => vault.id),
        ),
      ).pipe(map((cacheResult) => mapToVaultWithHistory(vaults, cacheResult, chainId)))
    }),
    shareReplay(1),
  )
}
