import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import {
  BasicBSTriggerData,
  extractBasicBSData,
} from 'features/automation/common/basicBSTriggerData'
import { gql, GraphQLClient } from 'graphql-request'
import { isEqual, memoize } from 'lodash'
import { combineLatest, from, Observable, timer } from 'rxjs'
import { distinctUntilChanged, shareReplay } from 'rxjs/internal/operators'
import { map, switchMap } from 'rxjs/operators'

import { Context } from '../../blockchain/network'
import { VaultWithType, VaultWithValue } from '../../blockchain/vaults'
import {
  extractStopLossData,
  StopLossTriggerData,
} from '../automation/protection/common/stopLossTriggerData'
import { fetchWithOperationId, flatEvents } from './vaultHistory'
import { ReturnedAutomationEvent, ReturnedEvent, VaultEvent } from './vaultHistoryEvents'

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
interface ActiveTrigger {
  cdpId: string
  triggerId: number
  commandAddress: string
  triggerData: string
}

interface CacheResult {
  events: ReturnedEvent[]
  automationEvents: ReturnedAutomationEvent[]
  activeTriggers: ActiveTrigger[]
}

async function getDataFromCache(
  client: GraphQLClient,
  urns: string[],
  cdpIds: BigNumber[],
): Promise<CacheResult> {
  const data = await client.request(query, { urns, cdpIds: cdpIds.map((id) => id.toNumber()) })

  return {
    events: data.allVaultMultiplyHistories.nodes,
    automationEvents: data.allTriggerEvents.nodes,
    activeTriggers: data.allActiveTriggers.nodes,
  }
}

export type VaultWithHistory = VaultWithValue<VaultWithType> & {
  history: VaultEvent[]
  stopLossData: StopLossTriggerData
  basicSellData: BasicBSTriggerData
}

function mapToVaultWithHistory(
  vaults: VaultWithValue<VaultWithType>[],
  { events, automationEvents, activeTriggers }: CacheResult,
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
      isAutomationEnabled,
      triggers,
    })
    const basicSellData = extractBasicBSData(
      {
        isAutomationEnabled,
        triggers,
      },
      TriggerType.BasicSell,
    )

    return {
      ...vault,
      history,
      stopLossData,
      basicSellData,
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
    switchMap(([{ cacheApi }, vaults]: [Context, VaultWithValue<VaultWithType>[]]) => {
      const apiClient = makeClient(cacheApi)
      return from(
        getDataFromCache(
          apiClient,
          vaults.map((vault) => vault.address.toLowerCase()),
          vaults.map((vault) => vault.id),
        ),
      ).pipe(map((cacheResult) => mapToVaultWithHistory(vaults, cacheResult)))
    }),
    shareReplay(1),
  )
}
