import type { NetworkNames } from 'blockchain/networks'
import { networksByName } from 'blockchain/networks'
import { ensureIsSupportedSparkV3NetworkId } from 'blockchain/spark-v3'
import type { TokenBalances } from 'blockchain/tokens.types'
import { getUserDpmProxy } from 'blockchain/userDpmProxies'
import type { AccountContext } from 'components/context/AccountContextProvider'
import dayjs from 'dayjs'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import { getApiVault } from 'features/shared/vaultApi'
import { getStopLossTransactionStateMachine } from 'features/stateMachines/stopLoss/getStopLossTransactionStateMachine'
import { createAaveHistory$ } from 'features/vaultHistory/vaultHistory'
import type { MainContext } from 'helpers/context/MainContext.types'
import type { ProductContext } from 'helpers/context/ProductContext.types'
import { one } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import type { AaveLikeReserveConfigurationData } from 'lendingProtocols/aave-like-common'
import { getAaveWstEthYield } from 'lendingProtocols/aave-v3/calculations/wstEthYield'
import { prepareAaveTotalValueLocked$ } from 'lendingProtocols/aave-v3/pipelines'
import { memoize } from 'lodash'
import { curry } from 'ramda'
import type { Observable } from 'rxjs'
import { merge, of, Subject } from 'rxjs'
import { filter, switchMap } from 'rxjs/operators'

import type { AaveContext } from './aave-context'
import { getCommonPartsFromProductContext } from './get-common-parts-from-app-context'
import type { AddressesRelatedWithPosition } from './helpers'
import { getAaveLikeStrategyConfig, getManageViewInfo, getManageViewInfoExternal } from './helpers'
import { getAssetsForMigration } from './helpers/getAssetsForMigration'
import {
  getManageAaveStateMachine,
  getManageAaveV3PositionStateMachineServices,
} from './manage/services'
import { getMigrateAaveV3PositionStateMachineServices } from './manage/services/aave-v3/getMigrateAaveV3PositionStateMachineServices'
import { getMigrateAaveStateMachine } from './manage/services/getMigrateAaveStateMachine'
import { getOpenAaveStateMachine, getOpenAaveV3PositionStateMachineServices } from './open/services'
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

export type StrategyUpdateParams = {
  positionId: PositionId
  networkName: NetworkNames
  vaultType?: VaultType
}

export function setupSparkV3Context(
  mainContext: MainContext,
  accountContext: AccountContext,
  productContext: ProductContext,
  network: NetworkNames,
): AaveContext {
  const networkId = networksByName[network].id
  ensureIsSupportedSparkV3NetworkId(networkId)

  const { txHelpers$, onEveryBlock$, context$, connectedContext$, chainContext$ } = mainContext
  const { userSettings$, proxyConsumed$ } = accountContext
  const { tokenPriceUSD$, protocols, commonTransactionServices } = productContext

  const {
    allowanceForAccount$,
    allowanceStateMachine,
    dpmAccountStateMachine,
    operationExecutorTransactionMachine,
    proxyForAccount$,
    proxyStateMachine,
    unconsumedDpmProxyForConnectedAccount$,
    disconnectedGraphQLClient$,
    chainLinkETHUSDOraclePrice$,
  } = getCommonPartsFromProductContext(
    mainContext,
    accountContext,
    productContext,
    onEveryBlock$,
    networkId,
  )

  const userDpms = memoize(getUserDpmProxy, (vaultId, chainId) => `${vaultId}-${chainId}`)
  const proxiesRelatedWithPosition$: (
    positionId: PositionId,
  ) => Observable<AddressesRelatedWithPosition> = memoize(
    (positionId) => {
      return of(undefined).pipe(
        switchMap(async () => {
          const dpm = await userDpms(positionId.vaultId!, networkId)
          return {
            dsProxy: undefined,
            dpmProxy: dpm,
            walletAddress: (dpm?.user || positionId.walletAddress)!,
          }
        }),
      )
    },
    (positionId) => JSON.stringify(positionId),
  )

  const protocolData = protocols[LendingProtocol.SparkV3][networkId]

  const {
    aaveLikeUserAccountData$,
    aaveLikeReserveConfigurationData$,
    aaveLikeOracleAssetPriceData$,
    getAaveLikeReserveData$,
    getAaveLikeAssetsPrices$,
  } = protocolData

  const aaveEarnYieldsQuery = memoize(
    curry(getAaveWstEthYield)(disconnectedGraphQLClient$, dayjs()),
    (riskRatio, fields) => JSON.stringify({ fields, riskRatio: riskRatio.multiple.toString() }),
  )

  const earnCollateralsReserveData = {
    WSTETH: aaveLikeReserveConfigurationData$({ collateralToken: 'WSTETH', debtToken: 'ETH' }),
  } as Record<string, Observable<AaveLikeReserveConfigurationData>>

  const aaveSupportedTokenBalances$ = memoize(
    curry(getAaveSupportedTokenBalances$)(
      aaveLikeOracleAssetPriceData$,
      of(one), // aave v3 base is already in USD
      getSupportedTokens(LendingProtocol.SparkV3, network),
      networkId,
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

  const openAaveParameters = getOpenAaveParametersMachine(txHelpers$, networkId)
  const closeAaveParameters = getCloseAaveParametersMachine(txHelpers$, networkId)
  const adjustAaveParameters = getAdjustAaveParametersMachine(txHelpers$, networkId)
  const depositBorrowAaveMachine = getDepositBorrowAaveMachine(txHelpers$, networkId)
  const migrateAaveMachine = getMigratePositionParametersMachine(networkId)

  const openAaveStateMachineServices = getOpenAaveV3PositionStateMachineServices(
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

  const manageAaveStateMachineServices = getManageAaveV3PositionStateMachineServices(
    context$,
    txHelpers$,
    tokenBalances$,
    proxyForAccount$,
    proxiesRelatedWithPosition$,
    userSettings$,
    tokenPriceUSD$,
    strategyInfo$,
    // aaveLikeProtocolData$,
    allowanceForAccount$,
    getAaveHistoryEvents,
    getAaveLikeReserveData$,
  )

  const stopLossTransactionStateMachine = getStopLossTransactionStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
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
    getAaveLikeReserveData$({ token: 'WSTETH' }),
    getAaveLikeReserveData$({ token: 'ETH' }),
    getAaveLikeAssetsPrices$({
      tokens: ['ETH', 'WSTETH'],
    }),
  )

  const aaveHistory$ = memoize(curry(createAaveHistory$)(chainContext$, onEveryBlock$))

  const migrationAssets = memoize(
    ({ positionId }: { positionId: PositionId }) =>
      getAssetsForMigration({ network: networkId, protocol: LendingProtocol.SparkV3, positionId }),
    (positionId) => JSON.stringify(positionId),
  )

  const strategyUpdateTrigger = new Subject<StrategyUpdateParams>()
  const strategyConfig$: (
    positionId: PositionId,
    networkName: NetworkNames,
    vaultType?: VaultType,
  ) => Observable<IStrategyConfig> = memoize(
    (positionId: PositionId, networkName: NetworkNames, vaultType) =>
      merge(
        // Subsequent updates from within x-state
        strategyUpdateTrigger.pipe(
          filter(
            (params) => params.positionId === positionId && params.networkName === networkName,
          ),
        ),
        // The initial trigger from WithAaveStrategy
        of({ positionId, networkName, vaultType }),
      ).pipe(
        switchMap((params) =>
          getAaveLikeStrategyConfig(params.positionId, params.networkName, params.vaultType),
        ),
      ),
    (positionId, networkName, vaultType) => JSON.stringify({ positionId, networkName, vaultType }),
  )

  function updateStrategyConfig(positionId: PositionId, networkName: NetworkNames) {
    return (vaultType: VaultType) => {
      strategyUpdateTrigger.next({
        positionId: positionId,
        networkName: networkName,
        vaultType: vaultType,
      })
    }
  }

  const manageViewInfo$ = memoize(
    curry(getManageViewInfo)({
      strategyConfig$,
      proxiesRelatedWithPosition$,
      getApiVault,
      chainId: networkId,
      networkName: network,
      lendingProtocol: LendingProtocol.SparkV3,
    }),
    (args: { positionId: PositionId }) => JSON.stringify(args),
  )

  const manageViewInfoExternal$ = memoize(
    curry(getManageViewInfoExternal)({
      strategyConfig$,
      proxiesRelatedWithPosition$,
      getApiVault,
      chainId: networkId,
      networkName: network,
      lendingProtocol: LendingProtocol.SparkV3,
      getExternalTokens: migrationAssets,
    }),
    (args: { positionId: PositionId }) => JSON.stringify(args),
  )

  return {
    ...protocolData,
    aaveStateMachine,
    aaveManageStateMachine,
    aaveTotalValueLocked$,
    aaveEarnYieldsQuery,
    strategyConfig$,
    updateStrategyConfig,
    proxiesRelatedWithPosition$,
    chainLinkETHUSDOraclePrice$,
    earnCollateralsReserveData,
    dpmAccountStateMachine,
    aaveHistory$,
    manageViewInfo$,
    manageViewInfoExternal$,
  }
}
