import BigNumber from 'bignumber.js'
import {
  createAaveOracleAssetPriceData$,
  createConvertToAaveOracleAssetPrice$,
} from 'blockchain/aave/oracleAssetPriceData'
import { getAaveV2AssetsPrices } from 'blockchain/calls/aave/aaveV2PriceOracle'
import {
  getAaveV2ReserveConfigurationData,
  getAaveV2ReserveData,
} from 'blockchain/calls/aave/aaveV2ProtocolDataProvider'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { observe } from 'blockchain/calls/observe'
import { getGasEstimation$, getOpenProxyStateMachine } from 'features/stateMachines/proxy/pipelines'
import { GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import moment from 'moment'
import { curry } from 'ramda'
import { Observable, of } from 'rxjs'
import { distinctUntilKeyChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { TokenBalances } from '../../blockchain/tokens'
import { UserDpmAccount } from '../../blockchain/userDpmProxies'
import { AppContext } from '../../components/AppContext'
import { getAllowanceStateMachine } from '../stateMachines/allowance'
import {
  getCreateDPMAccountTransactionMachine,
  getDPMAccountStateMachine,
} from '../stateMachines/dpmAccount'
import { transactionContextService } from '../stateMachines/transaction'
import { getAaveStEthYield } from './common'
import { getAvailableDPMProxy$ } from './common/services/getAvailableDPMProxy'
import {
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getDepositBorrowAaveMachine,
  getOpenAaveParametersMachine,
  getOpenDepositBorrowAaveMachine,
} from './common/services/getParametersMachines'
import { getStrategyInfo$ } from './common/services/getStrategyInfo'
import { prepareAaveTotalValueLocked$ } from './helpers/aavePrepareAaveTotalValueLocked'
import { createAaveV2PrepareReserveData$ } from './helpers/aaveV2PrepareReserveData'
import { getProxiesRelatedWithPosition$ } from './helpers/getProxiesRelatedWithPosition'
import {
  getManageAavePositionStateMachineServices,
  getManageAaveStateMachine,
} from './manage/services'
import {
  getOpenAavePositionStateMachineServices,
  getOpenAaveStateMachine,
  getOperationExecutorTransactionMachine,
} from './open/services'
import { getAaveSupportedTokenBalances$ } from './services/getAaveSupportedTokenBalances'
import { supportedTokens } from './strategyConfig'
import { PositionId } from './types'

export function setupAaveContext({
  userSettings$,
  connectedContext$,
  proxyAddress$,
  txHelpers$,
  gasPrice$,
  daiEthTokenPrice$,
  balance$,
  onEveryBlock$,
  context$,
  aaveUserAccountData$,
  tokenPriceUSD$,
  allowance$,
  aaveAvailableLiquidityInUSDC$,
  userDpmProxies$,
  userDpmProxy$,
  proxyConsumed$,
  aaveProtocolData$,
  strategyConfig$,
}: AppContext) {
  const chainlinkUSDCUSDOraclePrice$ = memoize(
    observe(onEveryBlock$, context$, getChainlinkOraclePrice('USDCUSD'), () => 'true'),
  )

  const chainLinkETHUSDOraclePrice$ = memoize(
    observe(onEveryBlock$, context$, getChainlinkOraclePrice('ETHUSD'), () => 'true'),
  )

  const contextForAddress$ = connectedContext$.pipe(
    distinctUntilKeyChanged('account'),
    shareReplay(1),
  )
  const disconnectedGraphQLClient$ = context$.pipe(
    distinctUntilKeyChanged('cacheApi'),
    map(({ cacheApi }) => new GraphQLClient(cacheApi)),
  )
  const aaveSthEthYieldsQuery = memoize(
    curry(getAaveStEthYield)(disconnectedGraphQLClient$, moment()),
    (riskRatio, fields) => JSON.stringify({ fields, riskRatio: riskRatio.multiple.toString() }),
  )
  const wrappedGetAaveReserveData$ = memoize(
    curry(createAaveV2PrepareReserveData$)(
      observe(onEveryBlock$, context$, getAaveV2ReserveData, (args) => args.token),
    ),
  )
  const aaveReserveConfigurationData$ = observe(
    onEveryBlock$,
    context$,
    getAaveV2ReserveConfigurationData,
    ({ token }) => token,
  )
  const aaveOracleAssetPriceData$ = memoize(
    curry(createAaveOracleAssetPriceData$)(onEveryBlock$, context$),
  )
  const convertToAaveOracleAssetPrice$ = memoize(
    curry(createConvertToAaveOracleAssetPrice$)(aaveOracleAssetPriceData$),
    (args: { token: string; amount: BigNumber }) => args.token + args.amount.toString(),
  )

  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)
  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$, userDpmProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const aaveSTETHReserveConfigurationData = aaveReserveConfigurationData$({ token: 'STETH' })

  const allowanceForAccount$: (token: string, spender: string) => Observable<BigNumber> = memoize(
    (token: string, spender: string) =>
      contextForAddress$.pipe(switchMap(({ account }) => allowance$(token, account, spender))),
    (token, spender) => `${token}-${spender}`,
  )
  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      balance$,
      aaveOracleAssetPriceData$,
      chainLinkETHUSDOraclePrice$,
      supportedTokens,
    ),
  )

  const tokenBalances$: Observable<TokenBalances | undefined> = context$.pipe(
    switchMap(({ account }) => {
      if (!account) return of(undefined)
      return aaveSupportedTokenBalances$(account)
    }),
  )

  const strategyInfo$ = memoize(
    curry(getStrategyInfo$)(aaveOracleAssetPriceData$, aaveReserveConfigurationData$),
  )

  const openAaveParameters = getOpenAaveParametersMachine(txHelpers$, gasEstimation$)
  const closeAaveParameters = getCloseAaveParametersMachine(txHelpers$, gasEstimation$)
  const adjustAaveParameters = getAdjustAaveParametersMachine(txHelpers$, gasEstimation$)
  const depositBorrowAaveMachine = getDepositBorrowAaveMachine(txHelpers$, gasEstimation$)
  const openDepositBorrowAaveMachine = getOpenDepositBorrowAaveMachine(txHelpers$, gasEstimation$)

  const commonTransactionServices = transactionContextService(context$)

  const allowanceStateMachine = getAllowanceStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const proxyStateMachine = getOpenProxyStateMachine(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )

  const dpmAccountTransactionMachine = getCreateDPMAccountTransactionMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )
  const dpmAccountStateMachine = getDPMAccountStateMachine(
    txHelpers$,
    gasEstimation$,
    dpmAccountTransactionMachine,
  )

  const operationExecutorTransactionMachine = curry(getOperationExecutorTransactionMachine)(
    txHelpers$,
    contextForAddress$,
    commonTransactionServices,
  )

  const getAvailableDPMProxy: (
    walletAddress: string,
  ) => Observable<UserDpmAccount | undefined> = memoize(
    curry(getAvailableDPMProxy$)(userDpmProxies$, proxyConsumed$),
  )

  const unconsumedDpmProxyForConnectedAccount$ = contextForAddress$.pipe(
    switchMap(({ account }) => getAvailableDPMProxy(account)),
  )

  const openAaveStateMachineServices = getOpenAavePositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveUserAccountData$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    aaveProtocolData$,
    allowanceForAccount$,
    unconsumedDpmProxyForConnectedAccount$,
    proxyConsumed$,
    aaveReserveConfigurationData$,
  )

  const manageAaveStateMachineServices = getManageAavePositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    proxiesRelatedWithPosition$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    aaveProtocolData$,
    allowanceForAccount$,
  )

  const aaveStateMachine = getOpenAaveStateMachine(
    openAaveStateMachineServices,
    openAaveParameters,
    openDepositBorrowAaveMachine,
    proxyStateMachine,
    dpmAccountStateMachine,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
  )

  const aaveManageStateMachine = getManageAaveStateMachine(
    manageAaveStateMachineServices,
    closeAaveParameters,
    adjustAaveParameters,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
    depositBorrowAaveMachine,
  )

  const getAaveReserveData$ = observe(
    onEveryBlock$,
    context$,
    getAaveV2ReserveData,
    (args) => args.token,
  )

  const getAaveAssetsPrices$ = observe(onEveryBlock$, context$, getAaveV2AssetsPrices, (args) =>
    args.tokens.join(''),
  )

  const aaveTotalValueLocked$ = curry(prepareAaveTotalValueLocked$)(
    getAaveReserveData$({ token: 'STETH' }),
    getAaveReserveData$({ token: 'ETH' }),
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC', 'STETH'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  return {
    aaveStateMachine,
    aaveManageStateMachine,
    aaveTotalValueLocked$,
    aaveReserveConfigurationData$,
    wrappedGetAaveReserveData$,
    aaveSthEthYieldsQuery,
    aaveProtocolData$,
    strategyConfig$,
    proxiesRelatedWithPosition$,
    getAaveAssetsPrices$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
    aaveSTETHReserveConfigurationData,
    aaveAvailableLiquidityInUSDC$,
    aaveOracleAssetPriceData$,
    convertToAaveOracleAssetPrice$,
    getAaveReserveData$,
    dpmAccountStateMachine,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
