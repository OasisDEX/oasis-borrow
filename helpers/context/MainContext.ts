import { createSend } from '@oasisdex/transactions'
import { getNetworkContracts } from 'blockchain/contracts'
import {
  ContextConnected,
  createAccount$,
  createContext$,
  createContextConnected$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import { createGasPrice$ } from 'blockchain/prices'
import { createWeb3Context$ } from 'features/web3Context'
import { createTxHelpers$ } from 'helpers/createTxHelpers'
import { Observable, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

import { DepreciatedServices, TxData, TxHelpers$ } from './types'

export function setupMainContext() {
  console.info('Main context setup')
  const once$ = of(undefined).pipe(shareReplay(1))
  const [web3Context$, setupWeb3Context$] = createWeb3Context$()
  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$, everyBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$)
  const chainContext$ = context$.pipe(
    distinctUntilChanged(
      (previousContext, newContext) => previousContext.chainId === newContext.chainId,
    ),
    shareReplay(1),
  )
  const oracleContext$ = context$.pipe(
    switchMap((ctx) =>
      of({ ...ctx, account: getNetworkContracts(NetworkIds.MAINNET, ctx.chainId).mcdSpot.address }),
    ),
    shareReplay(1),
  ) as Observable<ContextConnected>
  const account$ = createAccount$(web3Context$)
  const connectedContext$ = createContextConnected$(context$)
  const initializedAccount$ = createInitializedAccount$(account$)
  const [send] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    // @ts-ignore
    connectedContext$,
  )

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$)

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)

  return {
    account$,
    chainContext$,
    connectedContext$,
    context$,
    everyBlock$,
    gasPrice$,
    initializedAccount$,
    once$,
    onEveryBlock$,
    oracleContext$,
    send,
    setupWeb3Context$,
    txHelpers$,
    web3Context$,
    web3ContextConnected$,
  }
}

export type MainContext = ReturnType<typeof setupMainContext> & DepreciatedServices
