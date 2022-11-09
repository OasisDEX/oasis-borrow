import { getAaveAssetsPrices } from 'blockchain/calls/aave/aavePriceOracle'
import { getAaveReserveData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { observe } from 'blockchain/calls/observe'
import { getGasEstimation$, getOpenProxyStateMachine$ } from 'features/proxyNew/pipelines'
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
import { TokenBalances } from '../../blockchain/tokens'
import { AppContext } from '../../components/AppContext'
import { StrategyConfig } from './common/StrategyConfigTypes'
import { prepareAaveTotalValueLocked$ } from './helpers/aavePrepareAaveTotalValueLocked'
import {
  getClosePositionParametersStateMachine$,
  getClosePositionParametersStateMachineServices$,
  getManageAavePositionStateMachineServices$,
  getManageAaveStateMachine$,
} from './manage/services'
import { getAaveProtocolData$ } from './manage/services/getAaveProtocolData'
import {
  getOpenAaveParametersStateMachineServices$,
  getOpenAavePositionStateMachineServices,
  getOpenAaveTransactionMachine,
  getParametersStateMachine$,
} from './open/services'
import { getOpenAaveStateMachine$ } from './open/services'
import { strategies } from './strategyConfig'

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
  const contextForAddress$ = connectedContext$.pipe(distinctUntilKeyChanged('account'))

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

  const parametersStateMachineServices$ = getOpenAaveParametersStateMachineServices$(
    contextForAddress$,
    txHelpers$,
    gasEstimation$,
    userSettings$,
  )

  const parametersStateMachine$ = getParametersStateMachine$(parametersStateMachineServices$)

  const closePositionParametersStateMachineServices$ = getClosePositionParametersStateMachineServices$(
    contextForAddress$,
    txHelpers$,
    gasEstimation$,
    userSettings$,
  )
  const closePositionParametersStateMachine$ = getClosePositionParametersStateMachine$(
    closePositionParametersStateMachineServices$,
  )

  const proxyStateMachine$ = getOpenProxyStateMachine$(
    contextForAddress$,
    txHelpers$,
    proxyForAccount$,
    gasEstimation$,
  )

  const aaveReserveStEthData$ = aaveReserveConfigurationData$({ token: 'STETH' })

  const openAaveStateMachineServices = getOpenAavePositionStateMachineServices(
    contextForAddress$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveOracleAssetPriceData$,
    aaveReserveConfigurationData$,
    aaveUserConfiguration$,
    aaveReservesList$,
  )

  const aaveProtocolData$ = memoize(
    curry(getAaveProtocolData$)(
      aaveUserReserveData$,
      aaveUserAccountData$,
      aaveOracleAssetPriceData$,
      aaveUserConfiguration$,
      aaveReservesList$,
      aaveReserveConfigurationData$,
    ),
    (token, proxyAddress) => `${token}-${proxyAddress}`,
  )

  const manageAaveStateMachineServices$ = getManageAavePositionStateMachineServices$(
    contextForAddress$,
    txHelpers$,
    gasEstimation$,
    userSettings$,
    tokenBalances$,
    proxyForAccount$,
    aaveOracleAssetPriceData$,
    aaveReserveConfigurationData$,
    aaveProtocolData$,
  )

  const transactionMachine = getOpenAaveTransactionMachine(txHelpers$, contextForAddress$)

  const aaveStateMachine$ = getOpenAaveStateMachine$(
    openAaveStateMachineServices,
    parametersStateMachine$,
    proxyStateMachine$,
    transactionMachine,
    userSettings$,
    tokenPriceUSD$,
  )

  const aaveManageStateMachine$ = memoize(
    curry(getManageAaveStateMachine$)(
      manageAaveStateMachineServices$,
      closePositionParametersStateMachine$,
      transactionMachine,
      userSettings$,
      tokenPriceUSD$,
    ),
    ({ token, address, strategy }) => `${address}-${token}-${strategy}`,
  )

  const getAaveReserveData$ = observe(onEveryBlock$, context$, getAaveReserveData)
  const getAaveAssetsPrices$ = observe(onEveryBlock$, context$, getAaveAssetsPrices)

  const aaveTotalValueLocked$ = curry(prepareAaveTotalValueLocked$)(
    getAaveReserveData$({ token: 'STETH' }),
    getAaveReserveData$({ token: 'ETH' }),
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC', 'STETH'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  function detectAaveStrategy$(_address: string): Observable<StrategyConfig> {
    // TODO: properly detect fom chain or georgi method
    return of(strategies['aave-earn'])
  }

  return {
    aaveStateMachine$,
    aaveManageStateMachine$,
    aaveTotalValueLocked$,
    aaveReserveStEthData$,
    detectAaveStrategy$,
    aaveSthEthYieldsQuery,
    aaveProtocolData$,
  }
}

export type AaveContext = ReturnType<typeof setupAaveContext>
