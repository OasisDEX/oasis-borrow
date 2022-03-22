import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { gql, GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import flatten from 'lodash/flatten'
import pickBy from 'lodash/pickBy'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'

import { fetchWithOperationId, VaultHistoryEvent } from './vaultHistory'
import {
  MultiplyEvent,
  ReturnedAutomationEvent,
  ReturnedEvent,
  VaultEvent,
} from './vaultHistoryEvents'

const query = gql`
  query vaultMultiplyHistories($urn: String) {
    allVaultMultiplyHistories(
      filter: { urn: { equalTo: $urn } }
      orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        hash
        txId
        logIndex
        blockId
        blockNumber
        blockHash
        timestamp
        id
        urn
        kind
        marketPrice
        beforeLockedCollateral
        lockedCollateral
        beforeCollateralizationRatio
        collateralizationRatio
        beforeDebt
        debt
        beforeMultiple
        multiple
        beforeLiquidationPrice
        liquidationPrice
        netValue
        oazoFee
        loanFee
        gasFee
        totalFee
        bought
        depositCollateral
        depositDai
        sold
        withdrawnCollateral
        withdrawnDai
        exitCollateral
        exitDai
        collateralAmount
        daiAmount
        rate
        vaultCreator
        depositor
        cdpId
        transferFrom
        transferTo
        collateral
        auctionId
        liqPenalty
        collateralPrice
        coveredDebt
        remainingDebt
        remainingCollateral
        collateralTaken
        ilk
        oraclePrice
        ethPrice
      }
    }
  }
`

const triggerEventsQuery = gql`
  query triggerEvents($id: BigFloat) {
    allTriggerEvents(
      filter: { cdpId: { equalTo: $id } }
      orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        id
        triggerId
        cdpId
        number
        kind
        eventType
        hash
        timestamp
      }
    }
  }
`

export type VaultMultiplyHistoryEvent = MultiplyEvent & {
  token: string
  etherscan?: {
    url: string
    apiUrl: string
    apiKey: string
  }
}

function parseBigNumbersFields(
  event: Partial<ReturnedEvent & ReturnedAutomationEvent>,
): VaultEvent {
  const bigNumberFields = [
    'marketPrice',
    'beforeLockedCollateral',
    'lockedCollateral',
    'beforeCollateralizationRatio',
    'collateralizationRatio',
    'beforeDebt',
    'debt',
    'beforeMultiple',
    'multiple',
    'beforeLiquidationPrice',
    'liquidationPrice',
    'netValue',
    'oazoFee',
    'loanFee',
    'gasFee',
    'totalFee',
    'bought',
    'depositCollateral',
    'depositDai',
    'sold',
    'withdrawnCollateral',
    'withdrawnDai',
    'exitCollateral',
    'exitDai',
    'collateralAmount',
    'daiAmount',
    'rate',
    'collateral',
    'liqPenalty',
    'collateralPrice',
    'coveredDebt',
    'remainingDebt',
    'remainingCollateral',
    'collateralTaken',
    'oraclePrice',
    'ethPrice',
  ]
  return Object.entries(event).reduce(
    (acc, [key, value]) =>
      bigNumberFields.includes(key) && value != null
        ? { ...acc, [key]: new BigNumber(value) }
        : { ...acc, [key]: value },
    {},
  ) as VaultEvent
}

async function getVaultMultiplyHistory(
  client: GraphQLClient,
  urn: string,
): Promise<ReturnedEvent[]> {
  const data = await client.request(query, { urn })
  return data.allVaultMultiplyHistories.nodes
}

async function getVaultAutomationHistory(
  client: GraphQLClient,
  id: BigNumber,
): Promise<ReturnedAutomationEvent[]> {
  const triggersData = await client.request(triggerEventsQuery, { id: id.toNumber() })
  return triggersData.allTriggerEvents.nodes
}

function addReclaimFlag(events: VaultHistoryEvent[]) {
  return events.map((event, index, array) => {
    if (index === 0) {
      return { ...event, reclaim: false }
    }
    const previousEvent = array[index - 1]

    if (
      event.kind === 'DEPOSIT' &&
      previousEvent.kind === 'AUCTION_FINISHED_V2' &&
      previousEvent.remainingCollateral.eq(event.collateralAmount)
    ) {
      return { ...event, reclaim: true }
    }

    return { ...event, reclaim: false }
  })
}

export function createVaultMultiplyHistory$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  vault$: (id: BigNumber) => Observable<Vault>,
  vaultId: BigNumber,
): Observable<VaultHistoryEvent[]> {
  const makeClient = memoize(
    (url: string) => new GraphQLClient(url, { fetch: fetchWithOperationId }),
  )
  return combineLatest(context$, vault$(vaultId)).pipe(
    switchMap(([{ etherscan, cacheApi, ethtx }, { token, address, id }]) => {
      return onEveryBlock$.pipe(
        switchMap(() => {
          const apiClient = makeClient(cacheApi)

          return combineLatest(
            getVaultMultiplyHistory(apiClient, address.toLowerCase()),
            getVaultAutomationHistory(apiClient, id),
          )
        }),
        map(([returnedEvents, returnedAutomationEvents]) =>
          flatten(
            [...returnedEvents, ...returnedAutomationEvents]
              .map((returnedEvent) => pickBy(returnedEvent, (value) => value !== null))
              .map(parseBigNumbersFields),
          ),
        ),
        map((events) => events.map((event) => ({ etherscan, ethtx, token, ...event }))),
        map(addReclaimFlag),
        catchError(() => of([])),
      )
    }),
  )
}
