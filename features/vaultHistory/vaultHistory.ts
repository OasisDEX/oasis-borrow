import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { gql, GraphQLClient } from 'graphql-request'
import { flatten, memoize } from 'lodash'
import pickBy from 'lodash/pickBy'
import { equals } from 'ramda'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'

import {
  AutomationEvent,
  ReturnedAutomationEvent,
  ReturnedEvent,
  VaultEvent,
} from './vaultHistoryEvents'

export function unpackTriggerDataForHistory(event: AutomationEvent) {
  switch (event.kind) {
    case 'basic-buy':
    case 'basic-sell': {
      const basicBuyData = extractBasicBSData(
        {
          isAutomationEnabled: false,
          triggers: [
            {
              triggerId: Number(event.triggerId),
              commandAddress: event.commandAddress,
              executionParams: event.triggerData,
            },
          ],
        },
        event.kind === 'basic-buy' ? TriggerType.BasicBuy : TriggerType.BasicSell,
      )

      return {
        execCollRatio: basicBuyData.execCollRatio,
        targetCollRatio: basicBuyData.targetCollRatio,
        maxBuyOrMinSellPrice: basicBuyData.maxBuyOrMinSellPrice,
        maxBaseFeeInGwei: basicBuyData.maxBaseFeeInGwei,
      }
    }
    case 'stop-loss':
      const stopLossData = extractStopLossData({
        isAutomationEnabled: false,
        triggers: [
          {
            triggerId: Number(event.triggerId),
            commandAddress: event.commandAddress,
            executionParams: event.triggerData,
          },
        ],
      })

      return {
        stopLossLevel: stopLossData.stopLossLevel,
        isToCollateral: stopLossData.isToCollateral,
      }
    default:
      return event
  }
}

export function getAddOrRemoveTrigger(events: VaultHistoryEvent[]) {
  const addOrRemoveEvents = ['added', 'removed']

  const addOrRemoveEvent = events.find(
    (item) => 'triggerId' in item && addOrRemoveEvents.includes(item.eventType),
  ) as AutomationEvent

  if (addOrRemoveEvent && events.length === 1) {
    const historyKey =
      addOrRemoveEvent.eventType === 'added' ? 'addTriggerData' : 'removeTriggerData'

    return {
      ...addOrRemoveEvent,
      [historyKey]: unpackTriggerDataForHistory(addOrRemoveEvent),
    } as VaultHistoryEvent
  }

  return undefined
}

export function getUpdateTrigger(events: VaultHistoryEvent[]) {
  const updateCombination = ['added', 'removed']
  const eventTypes = events.reduce(
    (acc, curr) => [...acc, (curr as AutomationEvent).eventType],
    [] as string[],
  )
  const isUpdateTriggerEvent = equals(eventTypes, updateCombination)

  const autoEvent = events.find(
    (item) => 'triggerId' in item && updateCombination.includes(item.eventType),
  ) as AutomationEvent

  if (autoEvent && isUpdateTriggerEvent) {
    const addEvent = events[0] as AutomationEvent
    const removeEvent = events[1] as AutomationEvent

    return {
      ...autoEvent,
      addTriggerData: unpackTriggerDataForHistory(addEvent),
      removeTriggerData: unpackTriggerDataForHistory(removeEvent),
      eventType: 'updated',
    } as VaultHistoryEvent
  }

  return undefined
}

export function getExecuteTrigger(events: VaultHistoryEvent[]) {
  const postExecutionEvents = [
    'DECREASE_MULTIPLE',
    'INCREASE_MULTIPLE',
    'CLOSE_VAULT_TO_DAI',
    'CLOSE_VAULT_TO_COLLATERAL',
  ]
  const postExecutionEvent = events.find((item) => postExecutionEvents.includes(item.kind))
  const autoEvent = events.find((item) => 'triggerId' in item && item.eventType === 'executed') as
    | AutomationEvent
    | undefined

  if (postExecutionEvent && autoEvent) {
    return {
      ...postExecutionEvent,
      triggerId: autoEvent.triggerId,
      eventType: 'executed',
    } as VaultHistoryEvent
  }

  return undefined
}

export function mapAutomationEvents(events: VaultHistoryEvent[]) {
  const groupedByHash = events.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.hash]: [...(acc[curr.hash] ? acc[curr.hash] : []), curr],
    }
  }, {} as Record<string, VaultHistoryEvent[]>)

  const wrappedByHash = Object.keys(groupedByHash).reduce((acc, key) => {
    const updateTriggerEvent = getUpdateTrigger(groupedByHash[key])
    const executeTriggerEvent = getExecuteTrigger(groupedByHash[key])
    const addOrRemoveEvent = getAddOrRemoveTrigger(groupedByHash[key])

    if (updateTriggerEvent) {
      return { ...acc, [key]: [updateTriggerEvent] }
    }

    if (executeTriggerEvent) {
      return {
        ...acc,
        [key]: [executeTriggerEvent],
      }
    }

    if (addOrRemoveEvent) {
      return { ...acc, [key]: [addOrRemoveEvent] }
    }

    return { ...acc, [key]: groupedByHash[key] }
  }, {} as Record<string, VaultHistoryEvent[]>)

  return flatten(Object.values(wrappedByHash))
}

type WithSplitMark<T> = T & { splitId?: number }

export function splitEvents(
  event: VaultHistoryEvent,
): WithSplitMark<VaultHistoryEvent> | WithSplitMark<VaultHistoryEvent>[] {
  if (event.kind === 'DEPOSIT-GENERATE') {
    return [
      {
        ...event,
        kind: 'GENERATE',
        splitId: 0,
      },
      {
        ...event,
        kind: 'DEPOSIT',
        splitId: 1,
      },
    ]
  }
  if (event.kind === 'WITHDRAW-PAYBACK') {
    return [
      {
        ...event,
        kind: 'WITHDRAW',
        splitId: 0,
      },
      {
        ...event,
        kind: 'PAYBACK',
        splitId: 1,
      },
    ]
  }
  return event
}

export type VaultHistoryEvent = VaultEvent & {
  token: string
  etherscan?: {
    url: string
    apiUrl: string
    apiKey: string
  }
  ethx?: {
    url: string
  }
}
export function fetchWithOperationId(url: string, options?: RequestInit) {
  const operationNameRegex = /query (?<operationName>[a-zA-Z0-9]+)\(/gm

  const body = typeof options?.body === 'string' ? options?.body : ''
  const parsedBody: { query: string } = JSON.parse(body)
  const result = operationNameRegex.exec(parsedBody.query)
  const operationName = result ? result.groups?.operationName : undefined

  return fetch(url, { ...options, body: JSON.stringify({ ...parsedBody, operationName }) })
}

export interface VaultHistoryChange {
  kind: 'vaultHistory'
  vaultHistory: VaultHistoryEvent[]
}

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
  query triggerEvents($cdpId: BigFloat) {
    allTriggerEvents(
      filter: { cdpId: { equalTo: $cdpId } }
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
        triggerData
        commandAddress
      }
    }
  }
`

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
  const triggersData = await client.request(triggerEventsQuery, { cdpId: id.toNumber() })
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

export function flatEvents([events, automationEvents]: [
  ReturnedEvent[],
  ReturnedAutomationEvent[],
]) {
  return flatten(
    [...events, ...automationEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((returnedEvent) => pickBy(returnedEvent, (value) => value !== null))
      .map(parseBigNumbersFields),
  )
}

function mapEventsToVaultEvents(
  events$: Observable<[ReturnedEvent[], ReturnedAutomationEvent[]]>,
): Observable<VaultEvent[]> {
  return events$.pipe(
    map(([returnedEvents, returnedAutomationEvents]) =>
      flatEvents([returnedEvents, returnedAutomationEvents]),
    ),
  )
}

export function createVaultHistory$(
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
        mapEventsToVaultEvents,
        map((events) => events.map((event) => ({ etherscan, ethtx, ...event, token }))),
        map(addReclaimFlag),
        catchError(() => of([])),
      )
    }),
  )
}

export function createHistoryChange$(
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  id: BigNumber,
) {
  return vaultHistory$(id).pipe(
    map((vaultHistory) => ({
      kind: 'vaultHistory',
      vaultHistory,
    })),
  )
}
