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
} from 'blockchain/calls/callsHelpers'
import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from 'blockchain/calls/cdpManager'
import { pipHop, pipPeek, pipPeep, pipZzz } from 'blockchain/calls/osm'
import {
  CreateDsProxyData,
  createProxyAddress$,
  createProxyOwner$,
  SetProxyOwnerData,
} from 'blockchain/calls/proxy'
import {
  DepositAndGenerateData,
  OpenData,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions'
import { vatGem, vatIlk, vatUrns } from 'blockchain/calls/vat'
import { createIlkData$, createIlkDataList$, createIlks$ } from 'blockchain/ilks'
import { createGasPrice$, createOraclePriceData$ } from 'blockchain/prices'
import {
  createAccountBalance$,
  createAllowance$,
  createBalance$,
  createCollateralTokens$,
} from 'blockchain/tokens'
import { createController$, createVault$, createVaults$ } from 'blockchain/vaults'
import { pluginDevModeHelpers } from 'components/devModeHelpers'
import { createCollateralPrices$ } from 'features/collateralPrices/collateralPrices'
import { createIlkDataListWithBalances$ } from 'features/ilks/ilksWithBalances'
import { createLanding$ } from 'features/landing/landing'
import { createManageVault$, defaultManageVaultState } from 'features/manageVault/manageVault'
import { createOpenVault$, defaultOpenVaultState } from 'features/openVault/openVault'
import { redirectState$ } from 'features/router/redirectState'
import { createUserTokenInfo$ } from 'features/shared/userTokenInfo'
import { createFeaturedIlks$, createVaultsOverview$ } from 'features/vaultsOverview/vaultsOverview'
import { mapValues, memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable, of } from 'rxjs'
import { filter, map, shareReplay, switchMap } from 'rxjs/operators'

import { catIlk } from '../blockchain/calls/cat'
import {
  ApproveData,
  DisapproveData,
  tokenAllowance,
  tokenBalance,
} from '../blockchain/calls/erc20'
import { jugIlk } from '../blockchain/calls/jug'
import { observe } from '../blockchain/calls/observe'
import { spotIlk } from '../blockchain/calls/spot'
import { networksById } from '../blockchain/config'
import {
  ContextConnected,
  createAccount$,
  createContext$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
} from '../blockchain/network'
import { createTransactionManager } from '../features/account/transactionManager'
import { jwtAuthSetupToken$ } from '../features/termsOfService/jwt'
import {
  checkAcceptanceLocalStorage$,
  saveAcceptanceLocalStorage$,
} from '../features/termsOfService/termAcceptanceLocal'
import { createTermsAcceptance$ } from '../features/termsOfService/termsAcceptance'
import { HasGasEstimation } from '../helpers/form'

export type TxData =
  | OpenData
  | DepositAndGenerateData
  | WithdrawAndPaybackData
  | ApproveData
  | DisapproveData
  | CreateDsProxyData
  | SetProxyOwnerData

export interface TxHelpers {
  send: SendTransactionFunction<TxData>
  sendWithGasEstimation: SendTransactionFunction<TxData>
  estimateGas: EstimateGasFunction<TxData>
}

export const protoTxHelpers: TxHelpers = {
  send: () => null as any,
  sendWithGasEstimation: () => null as any,
  estimateGas: () => null as any,
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
  const chainIdToRpcUrl = mapValues(networksById, (network) => network.infuraUrl)
  const chainIdToDAIContractDesc = mapValues(networksById, (network) => network.tokens.DAI)
  const [web3Context$, setupWeb3Context$] = createWeb3Context$(
    chainIdToRpcUrl,
    chainIdToDAIContractDesc,
  )

  const account$ = createAccount$(web3Context$)
  const initializedAccount$ = createInitializedAccount$(account$)

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$)

  const connectedContext$ = context$.pipe(
    filter(({ status }) => status === 'connected'),
    shareReplay(1),
  ) as Observable<ContextConnected>

  const oracleContext$ = context$.pipe(
    switchMap((ctx) => of({ ...ctx, account: ctx.mcdSpot.address })),
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
  const proxyAddress$ = memoize(curry(createProxyAddress$)(onEveryBlock$, context$))
  const proxyOwner$ = memoize(curry(createProxyOwner$)(onEveryBlock$, context$))
  const cdpManagerUrns$ = observe(onEveryBlock$, context$, cdpManagerUrns, bigNumberTostring)
  const cdpManagerIlks$ = observe(onEveryBlock$, context$, cdpManagerIlks, bigNumberTostring)
  const cdpManagerOwner$ = observe(onEveryBlock$, context$, cdpManagerOwner, bigNumberTostring)
  const vatIlks$ = observe(onEveryBlock$, context$, vatIlk)
  const vatUrns$ = observe(onEveryBlock$, context$, vatUrns, ilkUrnAddressToString)
  const vatGem$ = observe(onEveryBlock$, context$, vatGem, ilkUrnAddressToString)
  const spotIlks$ = observe(onEveryBlock$, context$, spotIlk)
  const jugIlks$ = observe(onEveryBlock$, context$, jugIlk)
  const catIlks$ = observe(onEveryBlock$, context$, catIlk)

  const pipZzz$ = observe(onEveryBlock$, context$, pipZzz)
  const pipHop$ = observe(onEveryBlock$, context$, pipHop)
  const pipPeek$ = observe(onEveryBlock$, oracleContext$, pipPeek)
  const pipPeep$ = observe(onEveryBlock$, oracleContext$, pipPeep)

  const oraclePriceData$ = memoize(
    curry(createOraclePriceData$)(context$, pipPeek$, pipPeep$, pipZzz$, pipHop$),
  )

  const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance)
  const balance$ = curry(createBalance$)(onEveryBlock$, context$, tokenBalance$)

  const tokenAllowance$ = observe(onEveryBlock$, context$, tokenAllowance)
  const allowance$ = curry(createAllowance$)(context$, tokenAllowance$)

  const ilkToToken$ = of((ilk: string) => ilk.split('-')[0])

  const ilkData$ = memoize(
    curry(createIlkData$)(vatIlks$, spotIlks$, jugIlks$, catIlks$, ilkToToken$),
  )

  const controller$ = memoize(
    curry(createController$)(proxyOwner$, cdpManagerOwner$),
    bigNumberTostring,
  )

  const vault$ = memoize(
    curry(createVault$)(
      cdpManagerUrns$,
      cdpManagerIlks$,
      cdpManagerOwner$,
      vatUrns$,
      vatGem$,
      ilkData$,
      oraclePriceData$,
      controller$,
      ilkToToken$,
    ),
    bigNumberTostring,
  )

  pluginDevModeHelpers(txHelpers$, connectedContext$, proxyAddress$)

  const vaults$ = memoize(curry(createVaults$)(context$, proxyAddress$, vault$))

  const ilks$ = createIlks$(context$)

  const collateralTokens$ = createCollateralTokens$(ilks$, ilkToToken$)

  const accountBalances$ = curry(createAccountBalance$)(
    balance$,
    collateralTokens$,
    oraclePriceData$,
  )

  const ilkDataList$ = createIlkDataList$(ilkData$, ilks$)
  const ilksWithBalance$ = createIlkDataListWithBalances$(context$, ilkDataList$, accountBalances$)

  const userTokenInfo$ = memoize(curry(createUserTokenInfo$)(oraclePriceData$, balance$))

  const openVault$ = memoize(
    curry(createOpenVault$)(
      of(defaultOpenVaultState),
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      userTokenInfo$,
      ilkData$,
      ilks$,
      ilkToToken$,
    ),
  )

  const manageVault$ = memoize(
    curry(createManageVault$)(
      of(defaultManageVaultState),
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      userTokenInfo$,
      ilkData$,
      vault$,
    ),
    bigNumberTostring,
  )

  const collateralPrices$ = createCollateralPrices$(collateralTokens$, oraclePriceData$)

  const featuredIlks$ = createFeaturedIlks$(ilkDataList$)
  const vaultsOverview$ = memoize(
    curry(createVaultsOverview$)(vaults$, ilksWithBalance$, featuredIlks$),
  )
  const landing$ = curry(createLanding$)(ilkDataList$, featuredIlks$)

  const termsAcceptance$ = createTermsAcceptance$(
    web3Context$,
    'version-1',
    jwtAuthSetupToken$,
    checkAcceptanceLocalStorage$, // checkAcceptanceFromApi$,
    saveAcceptanceLocalStorage$, // saveAcceptanceFromApi$,
  )

  return {
    web3Context$,
    web3ContextConnected$,
    setupWeb3Context$,
    initializedAccount$,
    context$,
    onEveryBlock$,
    txHelpers$,
    transactionManager$,
    proxyAddress$,
    proxyOwner$,
    vaults$,
    vault$,
    ilks$,
    landing$,
    openVault$,
    manageVault$,
    vaultsOverview$,
    redirectState$,
    accountBalances$,
    collateralPrices$,
    termsAcceptance$,
  }
}

export function bigNumberTostring(v: BigNumber): string {
  return v.toString()
}

function ilkUrnAddressToString({ ilk, urnAddress }: { ilk: string; urnAddress: string }): string {
  return `${ilk}-${urnAddress}`
}

export type AppContext = ReturnType<typeof setupAppContext>
