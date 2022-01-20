import { Interface } from '@ethersproject/abi'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { ethers } from 'ethers'
import { List } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, mergeMap, shareReplay, withLatestFrom } from 'rxjs/operators'

import automationBot from '../../../blockchain/abi/automation-bot.json'

// TODO - ŁW - Implement tests for this file
function parseEvent(abi: Array<string>, ev: ethers.Event): TriggerRecord {
  const event = new Interface(abi).parseLog(ev)
  return {
    triggerId: parseInt(event.args['triggerId'].toString()),
    commandAddress: event.args['commandAddress'],
    executionParams: event.args['triggerData'],
  }
}

async function getEvents(
  vaultId: number,
  botAddress: string,
  provider: ethers.providers.Provider,
  blockNumber: number,
): Promise<TriggersData> {
  const abi = [
    'event TriggerAdded(uint256 indexed triggerId, address indexed commandAddress, uint256 indexed cdpId, bytes triggerData)',
    'event TriggerRemoved(uint256 indexed cdpId, uint256 indexed triggerId)',
  ]
  const contract = new ethers.Contract(botAddress ?? '', new Interface(automationBot), provider)

  const removedEventsList = await loadRemoveEvents()
  const addedEventsList = await loadAddEvents()

  if (removedEventsList.length > 0) {
    return returnFilteredAddTriggerEvents(removedEventsList, addedEventsList, abi)
  }
  return returnAllAddTriggerEvents(addedEventsList, abi)

  async function loadAddEvents() {
    const filterFromTriggerAdded = contract.filters.TriggerAdded(null, null, vaultId, null)
    const addedEventsList = await contract.queryFilter(
      filterFromTriggerAdded,
      process.env.DEPLOYMENT_BLOCK,
      blockNumber,
    )
    return addedEventsList
  }

  async function loadRemoveEvents() {
    const filterFromTriggerRemoved = contract.filters.TriggerRemoved(vaultId, null)
    const removedEventsList = await contract.queryFilter(
      filterFromTriggerRemoved,
      process.env.DEPLOYMENT_BLOCK,
      blockNumber,
    )
    return removedEventsList
  }
}

export interface TriggerRecord {
  triggerId: number
  commandAddress: string
  executionParams: string // bytes triggerData from TriggerAdded event
}

export interface TriggersData {
  isAutomationEnabled: boolean
  triggers: List<TriggerRecord> | undefined
}

function returnAllAddTriggerEvents(addedEventsList: ethers.Event[], abi: string[]) {
  const events = addedEventsList.map((singleEvent) => parseEvent(abi, singleEvent))
  return {
    triggers: events,
    isAutomationEnabled: events.length !== 0,
  }
}

function returnFilteredAddTriggerEvents(
  removedEventsList: ethers.Event[],
  addedEventsList: ethers.Event[],
  abi: string[],
) {
  const newestRemoveEvent = removedEventsList.reduce((latest, event) =>
    latest?.blockNumber > event.blockNumber ? latest : event,
  )
  const filteredAddedEvents = addedEventsList.filter((event) => {
    return newestRemoveEvent.blockNumber < event.blockNumber
  })
  const events = filteredAddedEvents.map((singleEvent) => parseEvent(abi, singleEvent))
  return {
    triggers: events,
    isAutomationEnabled: events.length !== 0,
  }
}

export function createAutomationTriggersData(
  context$: Observable<ContextConnected>,
  onEveryBlock$: Observable<number>,
  vauit$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<TriggersData> {
  return onEveryBlock$.pipe(
    withLatestFrom(context$, vauit$(id /*,context.chainId*/)),
    mergeMap(([blockNumber, , vault]) => {
      /* TODO: In future replace with oasis-cache query */
      const networkConfig = networksById[(vault as Vault).chainId]
      /* TODO: find proper current provider */
      var testProvider = new ethers.providers.Web3Provider((window as any).ethereum)
      return getEvents(
        (vault as Vault).id.toNumber() as number,
        networkConfig.automationBot.address,
        testProvider,
        blockNumber,
      )
    }),
    distinctUntilChanged((s1, s2) => {
      return JSON.stringify(s1) === JSON.stringify(s2)
    }),
    shareReplay(1),
  )
}
