import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { Vault } from 'blockchain/vaults.types'
import { extractAutoBSData } from 'features/automation/common/state/autoBSTriggerData'
import { extractAutoTakeProfitData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { mapMakerSubgraphAutomationHistoryOld } from 'features/vaultHistory/mapMakerSubgraphAutomationHistoryOld'
import { mapMakerSubgraphHistoryOld } from 'features/vaultHistory/mapMakerSubgraphHistoryOld'
import { flatten } from 'lodash'
import pickBy from 'lodash/pickBy'
import { equals } from 'ramda'
import type { Observable } from 'rxjs'
import { combineLatest, from, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'

import { groupHistoryEventsByHash } from './groupHistoryEventsByHash'
import type { VaultHistoryEvent, WithSplitMark } from './vaultHistory.types'
import type {
  AutomationEvent,
  ReturnedAutomationEvent,
  ReturnedEvent,
  VaultEvent,
} from './vaultHistoryEvents.types'

export function unpackTriggerDataForHistory(event: AutomationEvent) {
  switch (event.kind) {
    case 'basic-buy':
    case 'basic-sell': {
      const autoBSData = extractAutoBSData({
        triggersData: {
          isAutomationDataLoaded: true,
          isAutomationEnabled: false,
          chainId: event.chainId,
          triggers: [
            {
              triggerId: Number(event.triggerId),
              commandAddress: event.commandAddress,
              executionParams: event.triggerData,
            },
          ],
        },
        triggerType: event.kind === 'basic-buy' ? TriggerType.BasicBuy : TriggerType.BasicSell,
      })

      return {
        execCollRatio: autoBSData.execCollRatio,
        targetCollRatio: autoBSData.targetCollRatio,
        maxBuyOrMinSellPrice: autoBSData.maxBuyOrMinSellPrice,
        maxBaseFeeInGwei: autoBSData.maxBaseFeeInGwei,
      }
    }
    case 'stop-loss':
      const stopLossData = extractStopLossData({
        isAutomationDataLoaded: true,
        isAutomationEnabled: false,
        chainId: event.chainId,
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
    case 'auto-take-profit':
      const autoTakeProfitData = extractAutoTakeProfitData({
        isAutomationDataLoaded: true,
        isAutomationEnabled: false,
        chainId: event.chainId,
        triggers: [
          {
            triggerId: Number(event.triggerId),
            commandAddress: event.commandAddress,
            executionParams: event.triggerData,
          },
        ],
      })

      return {
        isToCollateral: autoTakeProfitData.isToCollateral,
        executionPrice: autoTakeProfitData.executionPrice,
      }
    default:
      return event
  }
}

export function getAddOrRemoveTrigger(events: VaultHistoryEvent[]) {
  const addOrRemove = ['added', 'removed']
  const addCombination = ['added']

  const eventTypes = events.reduce((acc, curr) => {
    if (acc.includes((curr as AutomationEvent).eventType)) {
      return acc
    }

    return [...acc, (curr as AutomationEvent).eventType]
  }, [] as string[])

  const addOrRemoveEvents = events.filter(
    (item) => 'triggerId' in item && addOrRemove.includes(item.eventType),
  ) as AutomationEvent[]

  if (addOrRemoveEvents.length) {
    const historyKey = equals(eventTypes, addCombination) ? 'addTriggerData' : 'removeTriggerData'

    return {
      ...addOrRemoveEvents[0],
      autoKind: addOrRemoveEvents[0].kind,
      [historyKey]: addOrRemoveEvents.map((item) => unpackTriggerDataForHistory(item)),
    } as VaultHistoryEvent
  }

  return undefined
}

export function getUpdateTrigger(events: VaultHistoryEvent[]) {
  const updateCombination = ['added', 'removed']

  const eventTypes = events
    .reduce((acc, curr) => {
      if (acc.includes((curr as AutomationEvent).eventType)) {
        return acc
      }

      return [...acc, (curr as AutomationEvent).eventType]
    }, [] as string[])
    .sort()

  const isUpdateTriggerEvent = equals(eventTypes, updateCombination)

  const autoEvent = events.find(
    (item) => 'triggerId' in item && updateCombination.includes(item.eventType),
  ) as AutomationEvent

  if (autoEvent && isUpdateTriggerEvent) {
    const addEvents = events.filter(
      (item) => 'triggerId' in item && item.eventType === 'added',
    ) as AutomationEvent[]

    const removeEvents = events.filter(
      (item) => 'triggerId' in item && item.eventType === 'removed',
    ) as AutomationEvent[]

    return {
      ...autoEvent,
      addTriggerData: addEvents.map((item) => unpackTriggerDataForHistory(item)),
      removeTriggerData: removeEvents.map((item) => unpackTriggerDataForHistory(item)),
      eventType: 'updated',
      autoKind: autoEvent.kind,
    } as VaultHistoryEvent
  }

  return undefined
}

export function getOverrideTriggers(events: VaultHistoryEvent[]) {
  const overrideCombinationV1 = ['added', 'added', 'removed']
  const overrideCombinationV2 = ['added', 'added', 'removed', 'removed']

  const eventTypes = events
    .reduce((acc, curr) => [...acc, (curr as AutomationEvent).eventType], [] as string[])
    .sort()
  const isOverrideTriggerEvent =
    equals(eventTypes, overrideCombinationV1) || equals(eventTypes, overrideCombinationV2)

  const standaloneEvents = events.filter(
    (item) => 'triggerId' in item && !('groupId' in item),
  ) as AutomationEvent[]

  const groupEvent = events.find(
    (item) => 'triggerId' in item && 'groupId' in item && item.groupId,
  ) as AutomationEvent

  if (standaloneEvents.length && groupEvent && isOverrideTriggerEvent) {
    const addEvents = events.filter(
      (item) => 'triggerId' in item && item.eventType === 'added',
    ) as AutomationEvent[]

    return [
      {
        ...groupEvent,
        addTriggerData: addEvents.map((item) => unpackTriggerDataForHistory(item)),
        eventType: 'added',
        autoKind: groupEvent.kind,
      } as VaultHistoryEvent,
      ...standaloneEvents.map(
        (item) =>
          ({
            ...item,
            removeTriggerData: [unpackTriggerDataForHistory(item)],
            eventType: 'removed',
            autoKind: item.kind,
          }) as VaultHistoryEvent,
      ),
    ]
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
      groupId: 'groupId' in autoEvent && autoEvent.groupId,
      eventType: 'executed',
      autoKind: autoEvent.kind,
    } as unknown as VaultHistoryEvent
  }

  return undefined
}

export function mapAutomationEvents(events: VaultHistoryEvent[]) {
  const groupedByHash = groupHistoryEventsByHash(events)

  const wrappedByHash = Object.keys(groupedByHash).reduce(
    (acc, key) => {
      const updateTriggerEvent = getUpdateTrigger(groupedByHash[key])
      const executeTriggerEvent = getExecuteTrigger(groupedByHash[key])
      const addOrRemoveEvent = getAddOrRemoveTrigger(groupedByHash[key])
      const overrideEvents = getOverrideTriggers(groupedByHash[key])

      if (overrideEvents) {
        return { ...acc, [key]: overrideEvents }
      }

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
    },
    {} as Record<string, VaultHistoryEvent[]>,
  )

  return flatten(Object.values(wrappedByHash))
}

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

export function fetchWithOperationId(url: string, options?: RequestInit) {
  const operationNameRegex = /query (?<operationName>[a-zA-Z0-9]+)\(/gm

  const body = typeof options?.body === 'string' ? options?.body : ''
  const parsedBody: { query: string } = JSON.parse(body)
  const result = operationNameRegex.exec(parsedBody.query)
  const operationName = result ? result.groups?.operationName : undefined

  return fetch(url, { ...options, body: JSON.stringify({ ...parsedBody, operationName }) })
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
  return combineLatest(context$, vault$(vaultId)).pipe(
    switchMap(([{ chainId }, { token, id }]) => {
      const { etherscan } = getNetworkContracts(NetworkIds.MAINNET, chainId)

      const historyFromSubgraph$ = from(
        loadSubgraph({
          subgraph: 'Discover',
          method: 'getMakerHistoryOld',
          networkId: chainId,
          params: {
            cdpId: id.toNumber(),
          },
        }),
      ) as Observable<SubgraphsResponses['Discover']['getMakerHistoryOld']>

      const automationHistoryFromSubgraph$ = from(
        loadSubgraph({
          subgraph: 'Automation',
          method: 'getMakerAutomationEvents',
          networkId: chainId,
          params: { cdpId: id.toNumber() },
        }),
      ) as Observable<SubgraphsResponses['Automation']['getMakerAutomationEvents']>

      return combineLatest(
        historyFromSubgraph$,
        automationHistoryFromSubgraph$,
        onEveryBlock$,
      ).pipe(
        switchMap(([{ response: _history }, { response: _automationHistory }]) => {
          return combineLatest(
            of(mapMakerSubgraphHistoryOld(_history.cdps[0].stateLogs)),
            of(mapMakerSubgraphAutomationHistoryOld(_automationHistory.triggerEvents)),
          )
        }),
        mapEventsToVaultEvents,
        map((events) => events.map((event) => ({ etherscan, ...event, token }))),
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
