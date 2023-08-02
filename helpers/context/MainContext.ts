import { createSend } from '@oasisdex/transactions'
import {
  createAccount$,
  createContext$,
  createContextConnected$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from 'blockchain/network'
import { createGasPrice$ } from 'blockchain/prices'
import { createWeb3Context$ } from 'features/web3Context'
import { createTxHelpers$ } from 'helpers/createTxHelpers'
import { of } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

import { DepreciatedServices, TxData, TxHelpers$ } from './types'

export function setupMainContext() {
  const once$ = of(undefined).pipe(shareReplay(1))
  const [web3Context$, setupWeb3Context$, switchChains] = createWeb3Context$()
  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$, everyBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$)
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
    web3Context$,
    web3ContextConnected$,
    setupWeb3Context$,
    context$,
    onEveryBlock$,
    everyBlock$,
    txHelpers$,
    connectedContext$,
    once$,
    switchChains,
  }
}

export type MainContext = ReturnType<typeof setupMainContext> & DepreciatedServices
