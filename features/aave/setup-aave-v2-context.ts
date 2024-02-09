import { NetworkIds, NetworkNames } from 'blockchain/networks'
import type { TokenBalances } from 'blockchain/tokens.types'
import type { AccountContext } from 'components/context/AccountContextProvider'
import dayjs from 'dayjs'
import { getApiVault } from 'features/shared/vaultApi'
import { getStopLossTransactionStateMachine } from 'features/stateMachines/stopLoss/getStopLossTransactionStateMachine'
import { createAaveHistory$ } from 'features/vaultHistory/vaultHistory'
import type { MainContext } from 'helpers/context/MainContext.types'
import type { ProductContext } from 'helpers/context/ProductContext.types'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveStEthYield } from 'lendingProtocols/aave-v2/calculations/stEthYield'
import { prepareAaveTotalValueLocked$ } from 'lendingProtocols/aave-v2/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import type { Observable } from 'rxjs'
import { EMPTY } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import type { AaveContext } from './aave-context'
import { getCommonPartsFromProductContext } from './get-common-parts-from-app-context'
import { getManageViewInfo } from './helpers'
import {
  getManageAaveStateMachine,
  getManageAaveV2PositionStateMachineServices,
} from './manage/services'
import { getMigrateAaveV3PositionStateMachineServices } from './manage/services/aave-v3/getMigrateAaveV3PositionStateMachineServices'
import { getMigrateAaveStateMachine } from './manage/services/getMigrateAaveStateMachine'
import { getOpenAaveStateMachine, getOpenAaveV2PositionStateMachineServices } from './open/services'
import {
  getAaveHistoryEvents,
  getAaveSupportedTokenBalances$,
  getAdjustAaveParametersMachine,
  getCloseAaveParametersMachine,
  getDepositBorrowAaveMachine,
  getMigratePositionParametersMachine,
  getOpenAaveParametersMachine,
  getStrategyInfo$,
} from './services'
import { getSupportedTokens } from './strategies'
import type { IStrategyConfig, PositionId } from './types'

export function setupAaveV2Context(
  mainContext: MainContext,
  accountContext: AccountContext,
  productContext: ProductContext,
): AaveContext {
  const { txHelpers$, onEveryBlock$, context$, connectedContext$, chainContext$ } = mainContext
  const { proxyConsumed$, userSettings$ } = accountContext
  const { tokenPriceUSD$, strategyConfig$, protocols, commonTransactionServices } = productContext

  const {
    allowanceForAccount$,
    allowanceStateMachine,
    dpmAccountStateMachine,
    operationExecutorTransactionMachine,
    proxyForAccount$,
    proxyStateMachine,
    proxiesRelatedWithPosition$,
    unconsumedDpmProxyForConnectedAccount$,
    disconnectedGraphQLClient$,
    chainLinkETHUSDOraclePrice$,
  } = getCommonPartsFromProductContext(
    mainContext,
    accountContext,
    productContext,
    onEveryBlock$,
    NetworkIds.MAINNET,
  )

  const {
    aaveLikeUserAccountData$,
    // aaveLikeProtocolData$,
    aaveLikeReserveConfigurationData$,
    aaveLikeOracleAssetPriceData$,
    getAaveLikeAssetsPrices$,
    getAaveLikeReserveData$,
  } = protocols[LendingProtocol.AaveV2]

  const aaveEarnYieldsQuery = memoize(
    curry(getAaveStEthYield)(disconnectedGraphQLClient$, dayjs()),
    (riskRatio, fields) => JSON.stringify({ fields, riskRatio: riskRatio.multiple.toString() }),
  )

  const earnCollateralsReserveData = {
    STETH: aaveLikeReserveConfigurationData$({ collateralToken: 'STETH', debtToken: 'ETH' }),
  } as Record<string, ReturnType<typeof aaveLikeReserveConfigurationData$>>

  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      aaveLikeOracleAssetPriceData$,
      chainLinkETHUSDOraclePrice$,
      getSupportedTokens(LendingProtocol.AaveV2, NetworkNames.ethereumMainnet),
      NetworkIds.MAINNET,
    ),
  )

  const tokenBalances$: Observable<TokenBalances> = context$.pipe(
    switchMap(({ account }) => {
      return aaveSupportedTokenBalances$(account)
    }),
  )

  const strategyInfo$ = memoize(
    curry(getStrategyInfo$)(aaveLikeOracleAssetPriceData$, aaveLikeReserveConfigurationData$),
    (tokens: IStrategyConfig['tokens']) => `${tokens.deposit}-${tokens.collateral}-${tokens.debt}`,
  )

  const openMultiplyAaveParameters = getOpenAaveParametersMachine(txHelpers$, NetworkIds.MAINNET)
  const closeAaveParameters = getCloseAaveParametersMachine(txHelpers$, NetworkIds.MAINNET)
  const adjustAaveParameters = getAdjustAaveParametersMachine(txHelpers$, NetworkIds.MAINNET)
  const depositBorrowAaveMachine = getDepositBorrowAaveMachine(txHelpers$, NetworkIds.MAINNET)
  const migrateAaveMachine = getMigratePositionParametersMachine(NetworkIds.MAINNET)

  const openAaveStateMachineServices = getOpenAaveV2PositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveLikeUserAccountData$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    // aaveLikeProtocolData$,
    allowanceForAccount$,
    unconsumedDpmProxyForConnectedAccount$,
    proxyConsumed$,
    aaveLikeReserveConfigurationData$,
    getAaveLikeReserveData$,
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
    allowanceForAccount$,
    getAaveHistoryEvents,
    getAaveLikeReserveData$,
  )

  const aaveStateMachine = getOpenAaveStateMachine(
    openAaveStateMachineServices,
    openMultiplyAaveParameters,
    proxyStateMachine,
    dpmAccountStateMachine,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
    stopLossTransactionStateMachine,
  )

  const migrateAaveStateMachineServices = getMigrateAaveV3PositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    aaveLikeUserAccountData$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    allowanceForAccount$,
    unconsumedDpmProxyForConnectedAccount$,
    proxyConsumed$,
    aaveLikeReserveConfigurationData$,
    getAaveLikeReserveData$,
  )

  const aaveMigrateStateMachine = getMigrateAaveStateMachine(
    migrateAaveStateMachineServices,
    migrateAaveMachine,
    dpmAccountStateMachine,
    allowanceStateMachine,
  )

  const aaveManageStateMachine = getManageAaveStateMachine(
    manageAaveStateMachineServices,
    closeAaveParameters,
    adjustAaveParameters,
    allowanceStateMachine,
    operationExecutorTransactionMachine,
    depositBorrowAaveMachine,
    aaveMigrateStateMachine,
  )

  const aaveTotalValueLocked$ = curry(prepareAaveTotalValueLocked$)(
    getAaveLikeReserveData$({ token: 'STETH' }),
    getAaveLikeReserveData$({ token: 'ETH' }),
    getAaveLikeAssetsPrices$({ tokens: ['USDC', 'STETH'] }),
  )

  const aaveHistory$ = memoize(curry(createAaveHistory$)(chainContext$, onEveryBlock$))

  const manageViewInfo$ = memoize(
    curry(getManageViewInfo)({
      strategyConfig$,
      proxiesRelatedWithPosition$,
      getApiVault,
      chainId: NetworkIds.MAINNET,
      networkName: NetworkNames.ethereumMainnet,
      lendingProtocol: LendingProtocol.AaveV2,
    }),
    (args: { positionId: PositionId }) => JSON.stringify(args),
  )

  return {
    ...protocols[LendingProtocol.AaveV2],
    aaveStateMachine,
    aaveManageStateMachine,
    aaveTotalValueLocked$,
    aaveEarnYieldsQuery,
    strategyConfig$,
    proxiesRelatedWithPosition$,
    chainLinkETHUSDOraclePrice$,
    earnCollateralsReserveData,
    dpmAccountStateMachine,
    aaveHistory$,
    manageViewInfo$,
    manageViewInfoExternal$: () => EMPTY, // We don't support external positions for Aave v2
  }
}
