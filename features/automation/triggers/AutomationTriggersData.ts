import { Interface } from '@ethersproject/abi'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { ethers } from 'ethers'
import { List } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, mergeMap, shareReplay, tap, withLatestFrom } from 'rxjs/operators'

import automationBot from '../../../blockchain/abi/automation-bot.json'

function parseEvent(abi: Array<string>, ev: ethers.Event): TriggerRecord {
  const intf = new Interface(abi)
  const parsedEvent = intf.parseLog(ev) as any
  return {
    triggerId: parseInt(parsedEvent.args['triggerId'].toString()),
    triggerType: parseInt(parsedEvent.args['triggerType'].toString()),
    executionParams: parsedEvent.args['triggerData'],
  }
}

async function getEvents(
  vaultId: number,
  botAddress: string,
  provider: ethers.providers.Provider,
  blockNumber: number,
): Promise<TriggersData> {
  const abi = [
    'event TriggerAdded( uint256 indexed triggerId, uint256 triggerType, uint256 indexed cdpId,  bytes triggerData)',
  ]

  const contract = new ethers.Contract(botAddress ?? '', new Interface(automationBot), provider)
  const filterFrom = contract.filters.TriggerAdded(null, null, vaultId, null)
  const eventsList = await contract.queryFilter(
    filterFrom,
    process.env.DEPLOYMENT_BLOCK,
    blockNumber,
  )
  const events = eventsList.map((singleEvent) => {
    const record: TriggerRecord = parseEvent(abi, singleEvent)
    return record
  })

  if (events.length === 0) {
    return {
      triggers: [],
      isAutomationEnabled: false,
    } as TriggersData
  } else {
    return {
      triggers: events,
      isAutomationEnabled: true,
    } as TriggersData
  }
}

export interface TriggerRecord {
  triggerId: number
  triggerType: number
  executionParams: string /* bytes triggerData  from TriggerAdded event*/
}

export interface TriggersData {
  isAutomationEnabled: boolean
  triggers: List<TriggerRecord> | undefined
}

export function createAutomationTriggersData(
  context$: Observable<ContextConnected>,
  onEveryBlock$: Observable<number>,
  vauit$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<TriggersData> {
  console.log('Building Observable<TriggersData> ')
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
