import { NetworkIds } from 'blockchain/networks'
import { createTokenPriceInUSD$ } from 'blockchain/prices'
import { tokenPrices$ } from 'blockchain/prices.constants'
import { getUserDpmProxy$ } from 'blockchain/userDpmProxies'
import type { AccountContext } from 'components/context'
import { getProxiesRelatedWithPosition$ } from 'features/aave/helpers'
import type { PositionId } from 'features/aave/types'
import { getAjnaPositionsWithDetails$ } from 'features/ajna/positions/common/observables/getAjnaPosition'
import { createAutomationTriggersData } from 'features/automation/api/automationTriggersData'
import { getApiVaults } from 'features/shared/vaultApi'
import type { AaveLikePosition } from 'features/vaultsOverview/pipes/positions'
import type { MainContext } from 'helpers/context/MainContext.types'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveV2Services } from 'lendingProtocols/aave-v2'
import { getSparkV3Services } from 'lendingProtocols/spark-v3'
import { memoize } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

import { createAaveV2Position$, createSparkV3DpmPosition$ } from './pipes/positions'
import { createMakerPositionsList$ } from './pipes/positionsList'
import { createPositionsList$ } from './vaultsOverview'
import curry from 'ramda/src/curry'

export function useOwnerPositions(
  {
    account$,
    chainContext$,
    connectedContext$,
    context$,
    everyBlock$,
    gasPrice$,
    once$,
    onEveryBlock$,
    oracleContext$,
    txHelpers$,
  }: MainContext,
  {
    balance$,
    cdpManagerIlks$,
    charterCdps$,
    cropJoinCdps$,
    ilkData$,
    ilkToToken$,
    mainnetDpmProxies$,
    optimismDpmProxies$,
    arbitrumDpmProxies$,
    mainnetReadPositionCreatedEvents$,
    optimismReadPositionCreatedEvents$,
    arbitrumReadPositionCreatedEvents$,
    oraclePriceData$,
    proxyAddress$,
    standardCdps$,
    urnResolver$,
    userSettings$,
    vatGem$,
    vatUrns$,
    vault$,
    vaults$,
  }: AccountContext,
) {
  const mainnetPositionCreatedEventsForProtocol$ = memoize(
    (walletAddress: string, protocol: LendingProtocol) => {
      return mainnetReadPositionCreatedEvents$(walletAddress).pipe(
        map((events) => events.filter((event) => event.protocol === protocol)),
      )
    },
    (wallet, protocol) => `${wallet}-${protocol}`,
  )

  const mainnetSparkV3PositionCreatedEvents$ = memoize((walletAddress: string) => {
    return mainnetPositionCreatedEventsForProtocol$(walletAddress, LendingProtocol.SparkV3)
  })

  const tokenPriceUSDStatic$ = memoize(
    curry(createTokenPriceInUSD$)(once$, tokenPrices$),
    (tokens: string[]) => tokens.sort((a, b) => a.localeCompare(b)).join(','),
  )

  const userDpmProxy$ = memoize(curry(getUserDpmProxy$)(context$), (vaultId) => vaultId)

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$, userDpmProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const automationTriggersData$ = memoize(
    curry(createAutomationTriggersData)(chainContext$, onEveryBlock$, proxiesRelatedWithPosition$),
  )

  const sparkV3Services = getSparkV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.MAINNET,
  })

  const sparkMainnetSparkV3Positions$: (walletAddress: string) => Observable<AaveLikePosition[]> =
    memoize(
      curry(createSparkV3DpmPosition$)(
        context$,
        mainnetDpmProxies$,
        tokenPriceUSDStatic$,
        mainnetSparkV3PositionCreatedEvents$,
        getApiVaults,
        automationTriggersData$,
        sparkV3Services,
        NetworkIds.MAINNET,
      ),
      (wallet) => wallet,
    )

  const mainnetAaveV2PositionCreatedEvents$ = memoize((walletAddress: string) => {
    return mainnetPositionCreatedEventsForProtocol$(walletAddress, LendingProtocol.AaveV2)
  })

  const aaveV2Services = getAaveV2Services({
    refresh$: onEveryBlock$,
  })

  const mainnetAaveV2Positions$: (walletAddress: string) => Observable<AaveLikePosition[]> =
    memoize(
      curry(createAaveV2Position$)(
        {
          dsProxy$: proxyAddress$,
          userDpmProxies$: mainnetDpmProxies$,
        },
        {
          tickerPrices$: tokenPriceUSDStatic$,
          context$,
          automationTriggersData$,
          readPositionCreatedEvents$: mainnetAaveV2PositionCreatedEvents$,
        },
        aaveV2Services,
      ),
    )

  const aaveMainnetAaveV3Positions$: (walletAddress: string) => Observable<AaveLikePosition[]> =
    memoize(
      curry(createAaveV3DpmPosition$)(
        context$,
        mainnetDpmProxies$,
        tokenPriceUSDStatic$,
        mainnetAaveV3PositionCreatedEvents$,
        getApiVaults,
        automationTriggersData$,
        aaveV3Services,
        NetworkIds.MAINNET,
      ),
      (wallet) => wallet,
    )

  const aaveOptimismPositions$: (walletAddress: string) => Observable<AaveLikePosition[]> = memoize(
    curry(createAaveV3DpmPosition$)(
      context$,
      optimismDpmProxies$,
      tokenPriceUSDStatic$,
      optimismReadPositionCreatedEvents$,
      getApiVaults,
      () => of<TriggersData | undefined>(undefined), // Triggers are not supported on optimism
      aaveV3OptimismServices,
      NetworkIds.OPTIMISMMAINNET,
    ),
    (wallet) => wallet,
  )

  const aaveArbitrumPositions$: (walletAddress: string) => Observable<AaveLikePosition[]> = memoize(
    curry(createAaveV3DpmPosition$)(
      context$,
      arbitrumDpmProxies$,
      tokenPriceUSDStatic$,
      arbitrumReadPositionCreatedEvents$,
      getApiVaults,
      () => of<TriggersData | undefined>(undefined), // Triggers are not supported on arbitrum
      aaveV3ArbitrumServices,
      NetworkIds.ARBITRUMMAINNET,
    ),
    (wallet) => wallet,
  )

  const aaveLikePositions$ = memoize((walletAddress: string) => {
    return combineLatest([
      mainnetAaveV2Positions$(walletAddress),
      aaveMainnetAaveV3Positions$(walletAddress),
      sparkMainnetSparkV3Positions$(walletAddress),
      aaveOptimismPositions$(walletAddress),
      aaveArbitrumPositions$(walletAddress),
    ]).pipe(
      map(
        ([
          mainnetAaveV2Positions,
          mainnetAaveV3Positions,
          mainnetSparkV3Positions,
          optimismAaveV3Positions,
          arbitrumAavePositions,
        ]) => {
          return [
            ...mainnetAaveV2Positions,
            ...mainnetAaveV3Positions,
            ...mainnetSparkV3Positions,
            ...optimismAaveV3Positions,
            ...arbitrumAavePositions,
          ]
        },
      ),
    )
  })

  const vaultsHistoryAndValue$ = memoize(
    curry(vaultsWithHistory$)(chainContext$, vaultWithValue$, refreshInterval),
  )

  const positionsList$ = memoize(
    curry(createMakerPositionsList$)(context$, ilksWithBalance$, vaultsHistoryAndValue$),
  )

  const ajnaPositions$ = memoize(
    curry(getAjnaPositionsWithDetails$)(
      context$,
      userDpmProxies$,
      readPositionCreatedEvents$,
      tokenPriceUSDStatic$,
    ),
    (walletAddress: string) => walletAddress,
  )

  const ownersPositionsList$ = memoize(
    curry(createPositionsList$)(positionsList$, aaveLikePositions$, ajnaPositions$, dsr$),
  )

  return {
    ownersPositionsList$: ownersPositionsList$,
  }
}
