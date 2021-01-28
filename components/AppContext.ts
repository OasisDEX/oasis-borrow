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
import { vatGem, vatIlk, vatUrns } from 'components/blockchain/calls/vat'
import { createGasPrice$ } from 'components/blockchain/prices'
import { createReadonlyAccount$ } from 'components/connectWallet/readonlyAccount'
import { createDepositForm$, LockAndDrawData } from 'features/deposit/deposit'
import { createLanding$ } from 'features/landing/landing'
import { mapValues } from 'lodash'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { filter, map, shareReplay } from 'rxjs/operators'

import { HasGasEstimation } from '../helpers/form'
import { createTransactionManager } from './account/transactionManager'
import { catIlk } from './blockchain/calls/cat'
import { ApproveData, tokenBalance } from './blockchain/calls/erc20'
import { jugIlk } from './blockchain/calls/jug'
import { observe } from './blockchain/calls/observe'
import { CreateDsProxyData } from './blockchain/calls/proxyRegistry'
import { spotIlk, spotPar } from './blockchain/calls/spot'
import { networksById } from './blockchain/config'
import { createIlk$, createIlkNames$ } from './blockchain/ilks'
import {
  ContextConnected,
  createAccount$,
  createContext$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from './blockchain/network'
import { createBalances$, createCollaterals$, createETHBalance$ } from './blockchain/tokens'
import {
  createController$,
  createTokenOraclePrice$,
  createVault$,
  createVaults$,
  createVaultSummary,
} from './blockchain/vaults'

export type TxData = LockAndDrawData | ApproveData | CreateDsProxyData

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

  // base
  const proxyAddress$ = curry(createProxyAddress$)(connectedContext$)
  const proxyOwner$ = curry(createProxyOwner$)(connectedContext$)
  const cdpManagerUrns$ = observe(
    onEveryBlock$,
    connectedContext$,
    cdpManagerUrns,
    bigNumberTostring,
  )
  const cdpManagerIlks$ = observe(
    onEveryBlock$,
    connectedContext$,
    cdpManagerIlks,
    bigNumberTostring,
  )
  const cdpManagerOwner$ = observe(
    onEveryBlock$,
    connectedContext$,
    cdpManagerOwner,
    bigNumberTostring,
  )
  const vatIlks$ = observe(onEveryBlock$, context$, vatIlk)
  const vatUrns$ = observe(onEveryBlock$, context$, vatUrns, ilkUrnAddressTostring)
  const vatGem$ = observe(onEveryBlock$, context$, vatGem, ilkUrnAddressTostring)
  const spotPar$ = observe(onEveryBlock$, context$, spotPar)
  const spotIlks$ = observe(onEveryBlock$, context$, spotIlk)
  const jugIlks$ = observe(onEveryBlock$, context$, jugIlk)
  const catIlks$ = observe(onEveryBlock$, context$, catIlk)

  const balance$ = observe(onEveryBlock$, connectedContext$, tokenBalance)

  const collaterals$ = createCollaterals$(context$)

  // computed
  const tokenOraclePrice$ = memoize(curry(createTokenOraclePrice$)(vatIlks$, spotPar$, spotIlks$))
  const ilk$ = memoize(curry(createIlk$)(vatIlks$, spotIlks$, jugIlks$, catIlks$))

  const controller$ = memoize(
    curry(createController$)(proxyOwner$, cdpManagerOwner$),
    bigNumberTostring,
  )
  const balances$ = memoize(curry(createBalances$)(collaterals$, balance$))

  const vault$ = memoize(
    curry(createVault$)(
      cdpManagerUrns$,
      cdpManagerIlks$,
      cdpManagerOwner$,
      vatUrns$,
      vatGem$,
      ilk$,
      tokenOraclePrice$,
      controller$,
    ),
    bigNumberTostring,
  )

  const vaults$ = curry(createVaults$)(connectedContext$, proxyAddress$, vault$)
  const vaultSummary$ = curry(createVaultSummary)(vaults$)
  const ethBalance$ = curry(createETHBalance$)(connectedContext$)

  const depositForm$ = memoize(
    curry(createDepositForm$)(connectedContext$, balance$, txHelpers$, vault$, ethBalance$),
    bigNumberTostring,
  )

  const ilkNames$ = createIlkNames$(context$)
  const landing$ = curry(createLanding$)(ilkNames$, ilk$)

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
    vaultSummary$,
    balances$,
    depositForm$,
    ethBalance$,
    landing$,
  }
}

function bigNumberTostring(v: BigNumber): string {
  return v.toString()
}

function ilkUrnAddressTostring({ ilk, urnAddress }: { ilk: string; urnAddress: string }): string {
  return `${ilk}-${urnAddress}`
}

export type AppContext = ReturnType<typeof setupAppContext>
