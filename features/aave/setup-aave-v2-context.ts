import { NetworkIds } from 'blockchain/networks'
import { NetworkNames } from 'blockchain/networks'
import { TokenBalances } from 'blockchain/tokens'
import { AppContext } from 'components/AppContext'
import { getStopLossTransactionStateMachine } from 'features/stateMachines/stopLoss/getStopLossTransactionStateMachine'
import { createAaveHistory$ } from 'features/vaultHistory/vaultHistory'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveStEthYield } from 'lendingProtocols/aave-v2/calculations/stEthYield'
import { prepareAaveTotalValueLocked$ } from 'lendingProtocols/aave-v2/pipelines'
import { memoize } from 'lodash'
import moment from 'moment/moment'
import { curry } from 'ramda'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { AaveContext } from './aave-context'
import { IStrategyConfig } from './common'
import {
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getDepositBorrowAaveMachine,
  getOpenDepositBorrowAaveMachine,
} from './common/services/getParametersMachines'
import { getStrategyInfo$ } from './common/services/getStrategyInfo'
import { getOpenMultiplyAaveParametersMachine } from './common/services/state-machines'
import { getCommonPartsFromAppContext } from './get-common-parts-from-app-context'
import {
  getManageAaveStateMachine,
  getManageAaveV2PositionStateMachineServices,
} from './manage/services'
import { getOpenAaveStateMachine, getOpenAaveV2PositionStateMachineServices } from './open/services'
import { getAaveSupportedTokenBalances$ } from './services/getAaveSupportedTokenBalances'
import { getSupportedTokens } from './strategy-config'

export function setupAaveV2Context(appContext: AppContext): AaveContext {
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
    chainContext$,
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
  } = getCommonPartsFromAppContext(appContext, onEveryBlock$, NetworkIds.MAINNET)

  const {
    aaveUserAccountData$,
    aaveProtocolData$,
    aaveReserveConfigurationData$,
    aaveOracleAssetPriceData$,
    getAaveAssetsPrices$,
    getAaveReserveData$,
  } = protocols[LendingProtocol.AaveV2]

  const aaveEarnYieldsQuery = memoize(
    curry(getAaveStEthYield)(disconnectedGraphQLClient$, moment()),
    (riskRatio, fields) => JSON.stringify({ fields, riskRatio: riskRatio.multiple.toString() }),
  )

  const earnCollateralsReserveData = {
    STETH: aaveReserveConfigurationData$({ collateralToken: 'STETH', debtToken: 'ETH' }),
  } as Record<string, ReturnType<typeof aaveReserveConfigurationData$>>

  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      balance$,
      aaveOracleAssetPriceData$,
      chainLinkETHUSDOraclePrice$,
      getSupportedTokens(LendingProtocol.AaveV2, NetworkNames.ethereumMainnet),
    ),
  )

  const tokenBalances$: Observable<TokenBalances> = context$.pipe(
    switchMap(({ account }) => {
      return aaveSupportedTokenBalances$(account)
    }),
  )

  const strategyInfo$ = memoize(
    curry(getStrategyInfo$)(aaveOracleAssetPriceData$, aaveReserveConfigurationData$),
    (tokens: IStrategyConfig['tokens']) => `${tokens.deposit}-${tokens.collateral}-${tokens.debt}`,
  )

  const openMultiplyAaveParameters = getOpenMultiplyAaveParametersMachine(
    txHelpers$,
    gasEstimation$,
    NetworkIds.MAINNET,
  )
  const closeAaveParameters = getCloseAaveParametersMachine(txHelpers$, gasEstimation$)
  const adjustAaveParameters = getAdjustAaveParametersMachine(txHelpers$, gasEstimation$)
  const depositBorrowAaveMachine = getDepositBorrowAaveMachine(txHelpers$, gasEstimation$)
  const openDepositBorrowAaveMachine = getOpenDepositBorrowAaveMachine(txHelpers$, gasEstimation$)

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
    openMultiplyAaveParameters,
    openDepositBorrowAaveMachine,
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

  const aaveTotalValueLocked$ = curry(prepareAaveTotalValueLocked$)(
    getAaveReserveData$({ token: 'STETH' }),
    getAaveReserveData$({ token: 'ETH' }),
    getAaveAssetsPrices$({ tokens: ['USDC', 'STETH'] }),
  )

  const aaveHistory$ = memoize(curry(createAaveHistory$)(chainContext$, onEveryBlock$))

  return {
    ...protocols[LendingProtocol.AaveV2],
    aaveStateMachine,
    aaveManageStateMachine,
    aaveTotalValueLocked$,
    aaveEarnYieldsQuery,
    strategyConfig$,
    proxiesRelatedWithPosition$,
    chainlinkUSDCUSDOraclePrice$,
    chainLinkETHUSDOraclePrice$,
    earnCollateralsReserveData,
    dpmAccountStateMachine,
    aaveHistory$,
  }
}
