import { getAaveV2AssetsPrices } from 'blockchain/aave'
import { observe } from 'blockchain/calls/observe'
import { TokenBalances } from 'blockchain/tokens'
import { AppContext } from 'components/AppContext'
import { getStopLossTransactionStateMachine } from 'features/stateMachines/stopLoss/getStopLossTransactionStateMachine'
import { LendingProtocol } from 'lendingProtocols'
import { prepareAaveTotalValueLocked$ } from 'lendingProtocols/aave-v2/pipelines'
import { memoize } from 'lodash'
import moment from 'moment'
import { curry } from 'ramda'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { getAaveStEthYield } from './common'
import {
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getDepositBorrowAaveMachine,
  getOpenAaveParametersMachine,
} from './common/services/getParametersMachines'
import { getStrategyInfo$ } from './common/services/getStrategyInfo'
import { getCommonPartsFromAppContext } from './getCommonPartsFromAppContext'
import {
  getManageAaveStateMachine,
  getManageAaveV2PositionStateMachineServices,
} from './manage/services'
import { getOpenAaveStateMachine, getOpenAaveV2PositionStateMachineServices } from './open/services'
import { getAaveSupportedTokenBalances$ } from './services/getAaveSupportedTokenBalances'
import { getSupportedTokens } from './strategyConfig'

export function setupAaveV2Context(appContext: AppContext) {
  const {
    userSettings$,
    txHelpers$,
    balance$,
    onEveryBlock$,
    context$,
    tokenPriceUSD$,
    proxyConsumed$,
    strategyConfig$,
    protocols,
    connectedContext$,
    commonTransactionServices,
  } = appContext

  const {
    allowanceForAccount$,
    allowanceStateMachine,
    dpmAccountStateMachine,
    gasEstimation$,
    operationExecutorTransactionMachine,
    proxyForAccount$,
    proxyStateMachine,
    proxiesRelatedWithPosition$,
    unconsumedDpmProxyForConnectedAccount$,
    disconnectedGraphQLClient$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
  } = getCommonPartsFromAppContext(appContext)

  const {
    aaveUserAccountData$,
    aaveAvailableLiquidityInUSDC$,
    aaveProtocolData$,
    aaveReserveConfigurationData$,
    wrappedGetAaveReserveData$,
    convertToAaveOracleAssetPrice$,
    aaveOracleAssetPriceData$,
    getAaveReserveData$,
  } = protocols[LendingProtocol.AaveV2]

  const aaveSthEthYieldsQuery = memoize(
    curry(getAaveStEthYield)(disconnectedGraphQLClient$, moment()),
    (riskRatio, fields) => JSON.stringify({ fields, riskRatio: riskRatio.multiple.toString() }),
  )

  const earnCollateralsReserveData = {
    STETH: aaveReserveConfigurationData$({ token: 'STETH' }),
  } as Record<string, ReturnType<typeof aaveReserveConfigurationData$>>

  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      balance$,
      aaveOracleAssetPriceData$,
      chainLinkETHUSDOraclePrice$,
      getSupportedTokens(LendingProtocol.AaveV2),
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

  const openAaveStateMachineServices = getOpenAaveV2PositionStateMachineServices(
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

  const stopLossTransactionStateMachine = getStopLossTransactionStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const manageAaveStateMachineServices = getManageAaveV2PositionStateMachineServices(
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
    proxyStateMachine,
    dpmAccountStateMachine,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
    stopLossTransactionStateMachine,
  )

  const aaveManageStateMachine = getManageAaveStateMachine(
    manageAaveStateMachineServices,
    closeAaveParameters,
    adjustAaveParameters,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
    depositBorrowAaveMachine,
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
    earnCollateralsReserveData,
    aaveAvailableLiquidityInUSDC$,
    aaveOracleAssetPriceData$,
    convertToAaveOracleAssetPrice$,
    getAaveReserveData$,
    dpmAccountStateMachine,
  }
}

export type AaveContext = ReturnType<typeof setupAaveV2Context>
