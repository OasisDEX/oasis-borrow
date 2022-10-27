import { getAaveAssetsPrices } from 'blockchain/calls/aave/aavePriceOracle'
import { getAaveReserveData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { getGasEstimation$, getOpenProxyStateMachine } from 'features/proxyNew/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import { Observable, of } from 'rxjs'
import { distinctUntilKeyChanged, shareReplay, switchMap } from 'rxjs/operators'

import {
  getAaveReservesList,
  getAaveUserAccountData,
  getAaveUserConfiguration,
} from '../../blockchain/calls/aave/aaveLendingPool'
import { getAaveOracleAssetPriceData } from '../../blockchain/calls/aave/aavePriceOracle'
import {
  getAaveReserveConfigurationData,
  getAaveUserReserveData,
} from '../../blockchain/calls/aave/aaveProtocolDataProvider'
import { OperationExecutorTxMeta } from '../../blockchain/calls/operationExecutor'
import { TokenBalances } from '../../blockchain/tokens'
import { AppContext } from '../../components/AppContext'
import {
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getOpenAaveParametersMachine,
} from './common/services/getParametersMachines'
import { getStrategyInfo$ } from './common/services/getStrategyInfo'
import { prepareAaveTotalValueLocked$ } from './helpers/aavePrepareAaveTotalValueLocked'
import { getStrategyConfig$ } from './helpers/getStrategyConfig'
import {
  getAaveProtocolData$,
  getManageAavePositionStateMachineServices,
  getManageAaveStateMachine,
} from './manage/services'
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
  aaveSthEthYieldsQuery,
  tokenPriceUSD$,
}: AppContext) {
  const once$ = of(undefined).pipe(shareReplay(1))
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

  const aaveReserveConfigurationData$ = observe(
    once$,
    context$,
    getAaveReserveConfigurationData,
    ({ token }) => token,
  )

  const aaveUserReserveData$ = observe(once$, context$, getAaveUserReserveData)

  const aaveOracleAssetPriceData$ = observe(once$, context$, getAaveOracleAssetPriceData)

  const aaveUserAccountData$ = observe(once$, context$, getAaveUserAccountData)
  const aaveUserConfiguration$ = observe(once$, context$, getAaveUserConfiguration)
  const aaveReservesList$ = observe(once$, context$, getAaveReservesList)

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

  const aaveReserveStEthData$ = aaveReserveConfigurationData$({ token: 'STETH' })

  const aaveProtocolData$ = memoize(
    curry(getAaveProtocolData$)(
      aaveUserReserveData$,
      aaveUserAccountData$,
      aaveOracleAssetPriceData$,
      aaveUserConfiguration$,
      aaveReservesList$,
      aaveReserveConfigurationData$,
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

  const transactionMachine = memoize(
    curry(getOpenAaveTransactionMachine)(txHelpers$, contextForAddress$),
    (transactionParameters: OperationExecutorTxMeta) => JSON.stringify(transactionParameters),
  )

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

  const getAaveReserveData$ = observe(onEveryBlock$, context$, getAaveReserveData)
  const getAaveAssetsPrices$ = observe(onEveryBlock$, context$, getAaveAssetsPrices)

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
    aaveReserveStEthData$,
    aaveSthEthYieldsQuery,
    aaveProtocolData$,
    strategyConfig$,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
