import { createSend, SendFunction } from '@oasisdex/transactions'
import { createWeb3Context$ } from '@oasisdex/web3-context'
import { BigNumber } from 'bignumber.js'
import {
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas,
  EstimateGasFunction,
  SendTransactionFunction,
  TransactionDef,
} from 'components/blockchain/calls/callsHelpers'
import {
  cdpManagerIlks,
  cdpManagerOwner,
  cdpManagerUrns,
} from 'components/blockchain/calls/cdpManager'
import { createProxyAddress$, createProxyOwner$ } from 'components/blockchain/calls/proxy'
import { vatGem, VatGemArgs, vatIlks, vatUrns, VatUrnsArgs } from 'components/blockchain/calls/vat'
import { createGasPrice$ } from 'components/blockchain/prices'
import { createReadonlyAccount$ } from 'components/connectWallet/readonlyAccount'
import { createCollateralPrice$, createController$, createVault$ } from 'features/vaults/vault'
import { createVaults$ } from 'features/vaults/vaults'
import { mapValues } from 'lodash'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { filter, map, shareReplay } from 'rxjs/operators'

import { HasGasEstimation } from '../helpers/form'
import { createTransactionManager } from './account/transactionManager'
import { jugIlks } from './blockchain/calls/jug'
import { observe as observeRaw } from './blockchain/calls/observe'
import { spotIlks, spotPar } from './blockchain/calls/spot'
import { networksById } from './blockchain/config'
import {
  ContextConnected,
  createAccount$,
  createContext$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from './blockchain/network'
import { memoize } from 'lodash'
import { tokenBalance } from './blockchain/calls/erc20'
import { createBalances$ } from '../features/balances'
import { createCollaterals$ } from '../features/collaterals'

export type TxData = never
// | ApproveData
// | DisapproveData

export interface TxHelpers {
  send: SendTransactionFunction<TxData>
  sendWithGasEstimation: SendTransactionFunction<TxData>
  estimateGas: EstimateGasFunction<TxData>
}

export type AddGasEstimationFunction = <S extends HasGasEstimation>(
  state: S,
  call: (send: TxHelpers, state: S) => Observable<number> | undefined,
) => Observable<S>

export type TxHelpers$ = Observable<TxHelpers>

function createTxHelpers$(
  context$: Observable<ContextConnected>,
  send: SendFunction<TxData>,
  gasPrice$: Observable<BigNumber>,
): TxHelpers$ {
  return context$.pipe(
    filter(({ status }) => status === 'connected'),
    map((context) => ({
      send: createSendTransaction(send, context),
      sendWithGasEstimation: createSendWithGasConstraints(send, context, gasPrice$),
      estimateGas: <B extends TxData>(def: TransactionDef<B>, args: B): Observable<number> => {
        return estimateGas(context, def, args)
      },
    })),
  )
}

export function setupAppContext() {
  const readonlyAccount$ = createReadonlyAccount$()

  const chainIdToRpcUrl = mapValues(networksById, (network) => network.infuraUrl)
  const chainIdToDAIContractDesc = mapValues(networksById, (network) => network.tokens.DAI)
  const [web3Context$, setupWeb3Context$] = createWeb3Context$(
    chainIdToRpcUrl,
    chainIdToDAIContractDesc,
  )

  const account$ = createAccount$(web3Context$)
  const initializedAccount$ = createInitializedAccount$(account$)

  web3Context$.subscribe((web3Context) =>
    console.log(
      'web3Context:',
      web3Context.status,
      (web3Context as any).chainId,
      (web3Context as any).account,
    ),
  )

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$, readonlyAccount$)

  const connectedContext$ = context$.pipe(
    filter(({ status }) => status === 'connected'),
    shareReplay(1),
  ) as Observable<ContextConnected>

  const [send, transactions$] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    connectedContext$,
  )

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$).pipe(
    map((x) => BigNumber.max(x.plus(1), x.multipliedBy(1.01).decimalPlaces(0, 0))),
  )

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)
  const transactionManager$ = createTransactionManager(transactions$)

  const observe = curry(observeRaw)(onEveryBlock$, connectedContext$)

  // base
  const proxyAddress$ = curry(createProxyAddress$)(connectedContext$)
  const proxyOwner$ = curry(createProxyOwner$)(connectedContext$)
  const cdpManagerUrns$ = observe(cdpManagerUrns, bigNumer2string)
  const cdpManagerIlks$ = observe(cdpManagerIlks, bigNumer2string)
  const cdpManagerOwner$ = observe(cdpManagerOwner, bigNumer2string)
  const vatIlks$ = observe(vatIlks)
  const vatUrns$ = observe(vatUrns, ilkUrnAddress2string)
  const vatGem$ = observe(vatGem, ilkUrnAddress2string)
  const spotPar$ = observe(spotPar)
  const spotIlks$ = observe(spotIlks)
  const jugIlks$ = observe(jugIlks)

  const balance$ = observe(tokenBalance)

  const collaterals$ = createCollaterals$(context$)

  // computed
  const collateralPrice$ = memoize(curry(createCollateralPrice$)(vatIlks$, spotPar$, spotIlks$))
  const controller$ = memoize(
    curry(createController$)(proxyOwner$, cdpManagerOwner$),
    bigNumer2string,
  )
  const balances$ = memoize(curry(createBalances$)(collaterals$, balance$))

  const vault$ = memoize(
    curry(createVault$)({
      cdpManagerUrns$,
      cdpManagerIlks$,
      vatUrns$,
      vatIlks$,
      vatGem$,
      cdpManagerOwner$,
      spotIlks$,
      jugIlks$,
      collateralPrice$,
      controller$,
    }),
    bigNumer2string,
  )

  const vaults$ = curry(createVaults$)(connectedContext$, proxyAddress$, vault$)

  return {
    web3Context$,
    setupWeb3Context$,
    initializedAccount$,
    context$,
    onEveryBlock$,
    txHelpers$,
    readonlyAccount$,
    transactionManager$,
    proxyAddress$,
    proxyOwner$,
    vaults$,
    vault$,
    balances$
  }
}

function bigNumer2string(v: BigNumber): string {
  return v.toString()
}
function ilkUrnAddress2string({ ilk, urnAddress }: VatUrnsArgs): string
function ilkUrnAddress2string({ ilk, urnAddress }: VatGemArgs): string
function ilkUrnAddress2string({ ilk, urnAddress }: any): string {
  return `${ilk}-${urnAddress}`
}

export type AppContext = ReturnType<typeof setupAppContext>
