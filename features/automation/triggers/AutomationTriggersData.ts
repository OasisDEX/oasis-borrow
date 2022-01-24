import { Interface } from '@ethersproject/abi'
import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { ethers } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { List } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, mergeMap, shareReplay, withLatestFrom } from 'rxjs/operators'

import { getAllActiveTriggers } from '../common/service/allActiveTriggers'
// TODO - ŁW - Implement tests for this file
function parseEvent(abi: Array<string>, ev: ethers.Event): TriggerRecord {
  const intf = new Interface(abi)
  const parsedEvent = intf.parseLog(ev) as any
  return {
    triggerId: parseInt(parsedEvent.args['triggerId'].toString()),
    triggerType: parseInt(parsedEvent.args['triggerType'].toString()),
    executionParams: parsedEvent.args['triggerData'],
  }
}

async function loadTriggerDataFromCache(
  vaultId: number,
  cacheApi: string
): Promise<TriggersData> {
  const activeTriggersForVault = getAllActiveTriggers(
    new GraphQLClient(cacheApi),
    vaultId.toFixed(0),
  )

  return {
    isAutomationEnabled: (await activeTriggersForVault).length > 0,
    triggers: await activeTriggersForVault
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
  return onEveryBlock$.pipe(
    withLatestFrom(context$, vauit$(id)),
    mergeMap(([, , vault]) => {
      const networkConfig = networksById[(vault as Vault).chainId]
      return loadTriggerDataFromCache(
        (vault as Vault).id.toNumber() as number,
        networkConfig.cacheApi
      )
    }),
    distinctUntilChanged((s1, s2) => {
      return JSON.stringify(s1) === JSON.stringify(s2)
    }),
    shareReplay(1),
  )
}
