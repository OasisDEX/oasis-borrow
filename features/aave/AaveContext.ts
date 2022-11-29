import { getAaveAssetsPrices } from 'blockchain/calls/aave/aavePriceOracle'
import { getAaveReserveData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { getChainlinkOraclePrice } from 'blockchain/calls/chainlink/chainlinkPriceOracle'
import { observe } from 'blockchain/calls/observe'
import { getGasEstimation$, getOpenProxyStateMachine } from 'features/proxyNew/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { combineLatest, from, Observable } from 'rxjs'
import { distinctUntilKeyChanged, filter, shareReplay, switchMap } from 'rxjs/operators'

import { TokenBalances } from '../../blockchain/tokens'
import { AppContext } from '../../components/AppContext'
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

export function setupAaveContext({
  userSettings$,
  connectedContext$,
  proxyAddress$,
  txHelpers$,
  gasPrice$,
  daiEthTokenPrice$,
  accountBalances$,
  onEveryBlock$,
  context$,
  aaveOracleAssetPriceData$,
  aaveReserveConfigurationData$,
  aaveUserReserveData$,
  aaveUserAccountData$,
  aaveUserConfiguration$,
  aaveReservesList$,
  aaveSthEthYieldsQuery,
  tokenPriceUSD$,
}: AppContext) {
  const contextForAddress$ = connectedContext$.pipe(
    distinctUntilKeyChanged('account'),
    shareReplay(1),
  )

  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)
  const proxyForAccount$: Observable<string | undefined> = contextForAddress$.pipe(
    switchMap(({ account }) => proxyAddress$(account)),
  )

  const tokenBalances$: Observable<TokenBalances> = contextForAddress$.pipe(
    switchMap(({ account }) => accountBalances$(account)),
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

  function tempPositionFromLib$(collateralToken: string, debtToken: string) {
    return combineLatest(context$, proxyForAccount$).pipe(
      filter(([context, proxyAddress]) => !!context && !!proxyAddress),
      switchMap(([context, proxyAddress]) => {
        proxyAddress = proxyAddress!
        return from(getOnChainPosition({ context, proxyAddress, collateralToken, debtToken }))
      }),
      shareReplay(1),
    )
  }

  const aaveProtocolData$ = memoize(
    curry(getAaveProtocolData$)(
      aaveUserReserveData$,
      aaveUserAccountData$,
      aaveOracleAssetPriceData$,
      aaveUserConfiguration$,
      aaveReservesList$,
      tempPositionFromLib$,
    ),
    (collateralToken, address) => `${collateralToken}-${address}`,
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
  )

  const transactionMachine = curry(getOpenAaveTransactionMachine)(txHelpers$, contextForAddress$)

  const aaveStateMachine = getOpenAaveStateMachine(
    openAaveStateMachineServices,
    openAaveParameters,
    proxyStateMachine,
    transactionMachine,
  )

  const aaveManageStateMachine = getManageAaveStateMachine(
    manageAaveStateMachineServices,
    closeAaveParameters,
    adjustAaveParameters,
    transactionMachine,
  )

  const getAaveReserveData$ = observe(
    onEveryBlock$,
    context$,
    getAaveReserveData,
    (args) => args.token,
  )

  const wrappedGetAaveReserveData$ = memoize(
    curry(createAavePrepareReserveData$)(
      observe(onEveryBlock$, context$, getAaveReserveData, (args) => args.token),
    ),
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

  const chainlinkUSDCUSDOraclePrice$ = observe(
    onEveryBlock$,
    context$,
    getChainlinkOraclePrice('USDCUSD'),
    () => 'true',
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
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
