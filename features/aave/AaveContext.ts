import BigNumber from 'bignumber.js'
import {
  createAaveOracleAssetPriceData$,
  createConvertToAaveOracleAssetPrice$,
} from 'blockchain/aave/oracleAssetPriceData'
import {
  getAaveReservesList,
  getAaveUserConfiguration,
} from 'blockchain/calls/aave/aaveLendingPool'
import { getAaveAssetsPrices } from 'blockchain/calls/aave/aavePriceOracle'
import {
  getAaveReserveConfigurationData,
  getAaveReserveData,
  getAaveUserReserveData,
} from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { observe } from 'blockchain/calls/observe'
import { getGasEstimation$, getOpenProxyStateMachine } from 'features/stateMachines/proxy/pipelines'
import { GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import moment from 'moment'
import { curry } from 'ramda'
import { from, Observable } from 'rxjs'
import { distinctUntilKeyChanged, map, shareReplay, switchMap } from 'rxjs/operators'

import { TokenBalances } from '../../blockchain/tokens'
import { AppContext } from '../../components/AppContext'
import { getAllowanceStateMachine } from '../stateMachines/allowance'
import { transactionContextService } from '../stateMachines/transaction'
import { getAaveStEthYield } from './common'
import {
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getOpenAaveParametersMachine,
} from './common/services/getParametersMachines'
import { getStrategyInfo$ } from './common/services/getStrategyInfo'
import { prepareAaveTotalValueLocked$ } from './helpers/aavePrepareAaveTotalValueLocked'
import { createAavePrepareReserveData$ } from './helpers/aavePrepareReserveData'
import { getStrategyConfig$ } from './helpers/getStrategyConfig'
import {
  getAaveProtocolData$,
  getManageAavePositionStateMachineServices,
  getManageAaveStateMachine,
} from './manage/services'
import { getOnChainPosition } from './oasisActionsLibWrapper'
import {
  getOpenAavePositionStateMachineServices,
  getOpenAaveStateMachine,
  getOpenAaveTransactionMachine,
} from './open/services'
import { getAaveSupportedTokenBalances$ } from './services/getAaveSupportedTokenBalances'
import { strategies } from './strategyConfig'

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
    curry(createAavePrepareReserveData$)(
      observe(onEveryBlock$, context$, getAaveReserveData, (args) => args.token),
    ),
  )
  const aaveUserReserveData$ = observe(onEveryBlock$, context$, getAaveUserReserveData)
  const aaveUserConfiguration$ = observe(onEveryBlock$, context$, getAaveUserConfiguration)
  const aaveReservesList$ = observe(onEveryBlock$, context$, getAaveReservesList)
  const aaveReserveConfigurationData$ = observe(
    onEveryBlock$,
    context$,
    getAaveReserveConfigurationData,
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
  const aaveSTETHReserveConfigurationData = aaveReserveConfigurationData$({ token: 'STETH' })

  const allowanceForAccount$: (token: string, spender: string) => Observable<BigNumber> = memoize(
    (token: string, spender: string) =>
      contextForAddress$.pipe(switchMap(({ account }) => allowance$(token, account, spender))),
    (token, spender) => `${token}-${spender}`,
  )

  const supportedTokens = Array.from(
    new Set(Object.values(strategies).map((strategy) => strategy.tokens.deposit)),
  )
  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      balance$,
      aaveOracleAssetPriceData$,
      chainLinkETHUSDOraclePrice$,
      supportedTokens,
    ),
  )
  const tokenBalances$: Observable<TokenBalances> = contextForAddress$.pipe(
    switchMap(({ account }) => aaveSupportedTokenBalances$(account)),
  )

  const strategyInfo$ = memoize(
    curry(getStrategyInfo$)(aaveOracleAssetPriceData$, aaveReserveConfigurationData$),
  )

  const openAaveParameters = getOpenAaveParametersMachine(txHelpers$, gasEstimation$)
  const closeAaveParameters = getCloseAaveParametersMachine(txHelpers$, gasEstimation$)
  const adjustAaveParameters = getAdjustAaveParametersMachine(txHelpers$, gasEstimation$)

  const proxyStateMachine = getOpenProxyStateMachine(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )

  function tempPositionFromLib$(collateralToken: string, debtToken: string, proxyAddress: string) {
    return context$.pipe(
      switchMap((context) => {
        return from(getOnChainPosition({ context, proxyAddress, collateralToken, debtToken }))
      }),
      shareReplay(1),
    )
  }

  const commonTransactionServices = transactionContextService(context$)

  const allowanceStateMachine = getAllowanceStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const operationExecutorTransactionMachine = curry(getOpenAaveTransactionMachine)(
    txHelpers$,
    contextForAddress$,
    commonTransactionServices,
  )

  const aaveProtocolData$ = memoize(
    curry(getAaveProtocolData$)(
      aaveUserReserveData$,
      aaveUserAccountData$,
      aaveOracleAssetPriceData$,
      aaveUserConfiguration$,
      aaveReservesList$,
      tempPositionFromLib$,
    ),
    (collateralToken, debtToken, proxyAddress) => `${collateralToken}-${debtToken}-${proxyAddress}`,
  )

  const openAaveStateMachineServices = getOpenAavePositionStateMachineServices(
    connectedContext$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveUserAccountData$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    aaveProtocolData$,
    allowanceForAccount$,
  )

  const manageAaveStateMachineServices = getManageAavePositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    proxyAddress$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    aaveProtocolData$,
    allowanceForAccount$,
  )

  const aaveStateMachine = getOpenAaveStateMachine(
    openAaveStateMachineServices,
    openAaveParameters,
    proxyStateMachine,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
  )

  const aaveManageStateMachine = getManageAaveStateMachine(
    manageAaveStateMachineServices,
    closeAaveParameters,
    adjustAaveParameters,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
  )

  const getAaveReserveData$ = observe(
    onEveryBlock$,
    context$,
    getAaveReserveData,
    (args) => args.token,
  )

  const getAaveAssetsPrices$ = observe(onEveryBlock$, context$, getAaveAssetsPrices, (args) =>
    args.tokens.join(''),
  )

  const aaveTotalValueLocked$ = curry(prepareAaveTotalValueLocked$)(
    getAaveReserveData$({ token: 'STETH' }),
    getAaveReserveData$({ token: 'ETH' }),
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC', 'STETH'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  const strategyConfig$ = memoize(
    curry(getStrategyConfig$)(proxyAddress$, aaveUserConfiguration$, aaveReservesList$),
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
    getAaveAssetsPrices$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
    aaveSTETHReserveConfigurationData,
    aaveAvailableLiquidityInUSDC$,
    aaveOracleAssetPriceData$,
    convertToAaveOracleAssetPrice$,
    getAaveReserveData$,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
