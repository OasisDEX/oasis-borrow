// tslint:disable:no-console
import {
  Web3Context,
  Web3ContextConnected,
  Web3ContextConnectedReadonly,
} from '@oasisdex/web3-context'
import { contract, ContractDesc } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { bindNodeCallback, combineLatest, concat, interval, Observable } from 'rxjs'
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  skip,
  startWith,
  switchMap,
} from 'rxjs/operators'
import Web3 from 'web3'

import { NetworkConfig, networksById } from './config'

export const every1Seconds$ = interval(1000).pipe(startWith(0))
export const every3Seconds$ = interval(3000).pipe(startWith(0))
export const every5Seconds$ = interval(5000).pipe(startWith(0))
export const every10Seconds$ = interval(10000).pipe(startWith(0))

interface WithContractMethod {
  contract: <T>(desc: ContractDesc) => T
}

interface WithWeb3ProviderGetPastLogs {
  web3ProviderGetPastLogs: Web3
}

export type ContextConnectedReadOnly = NetworkConfig &
  Web3ContextConnectedReadonly &
  WithContractMethod &
  WithWeb3ProviderGetPastLogs

export type ContextConnected = NetworkConfig &
  Web3ContextConnected &
  WithContractMethod &
  WithWeb3ProviderGetPastLogs

export type Context = ContextConnected | ContextConnectedReadOnly

export function createContext$(
  web3ContextConnected$: Observable<Web3ContextConnected | Web3ContextConnectedReadonly>,
): Observable<Context> {
  return web3ContextConnected$.pipe(
    map((web3Context) => {
      // magic link has limit for querying block range and we can't get events in one call
      // couldn't get information from them about what block range they allow
      const networkData = networksById[web3Context.chainId]
      const web3ProviderGetPastLogs =
        web3Context.connectionKind === 'magicLink'
          ? new Web3(networkData.infuraUrl)
          : web3Context.web3

      return {
        ...networkData,
        ...web3Context,
        contract: <T>(c: ContractDesc) => contract(web3Context.web3, c) as T,
        web3ProviderGetPastLogs,
      } as Context
    }),
    shareReplay(1),
  )
}

export function createContextConnected$(
  context$: Observable<Context>,
): Observable<ContextConnected> {
  return context$.pipe(
    filter(({ status }) => status === 'connected'),
    shareReplay(1),
  )
}

export type EveryBlockFunction$ = <O>(
  o$: Observable<O>,
  compare?: (x: O, y: O) => boolean,
) => Observable<O>

export function compareBigNumber(a1: BigNumber, a2: BigNumber): boolean {
  return a1.comparedTo(a2) === 0
}

export function createOnEveryBlock$(
  web3Context$: Observable<Web3ContextConnected | Web3ContextConnectedReadonly>,
): [Observable<number>, EveryBlockFunction$] {
  const onEveryBlock$ = combineLatest(web3Context$, every5Seconds$).pipe(
    switchMap(([{ web3 }]) => bindNodeCallback(web3.eth.getBlockNumber)()),
    catchError((error, source) => {
      console.log(error)
      return concat(every5Seconds$.pipe(skip(1), first()), source)
    }),
    distinctUntilChanged(),
    shareReplay(1),
  )

  function everyBlock$<O>(o$: Observable<O>, compare?: (x: O, y: O) => boolean) {
    return onEveryBlock$.pipe(
      switchMap(() => o$),
      distinctUntilChanged(compare),
    )
  }

  return [onEveryBlock$, everyBlock$]
}

export function createWeb3ContextConnected$(web3Context$: Observable<Web3Context>) {
  return web3Context$.pipe(
    filter(({ status }) => status === 'connected' || status === 'connectedReadonly'),
  ) as Observable<Web3ContextConnected | Web3ContextConnectedReadonly>
}

export function createAccount$(web3Context$: Observable<Web3Context>) {
  return web3Context$.pipe(
    map((status) => (status.status === 'connected' ? status.account : undefined)),
  )
}

export function createInitializedAccount$(account$: Observable<string | undefined>) {
  return account$.pipe(
    filter((account: string | undefined) => account !== undefined),
  ) as Observable<string>
}

export function reload(network: string) {
  if (document.location.href.indexOf('network=') !== -1) {
    document.location.href = document.location.href.replace(/network=[a-z]+/i, 'network=' + network)
  } else {
    document.location.href = document.location.href + '?network=' + network
  }
}

export enum NetworkIds {
  MAINNET = 1,
  GOERLI = 5,
  HARDHAT = 2137,
}
