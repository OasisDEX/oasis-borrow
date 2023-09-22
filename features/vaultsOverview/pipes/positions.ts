import type { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { Context } from 'blockchain/network.types'
import { getNetworkById, NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { amountFromPrecision } from 'blockchain/utils'
import type { VaultWithType, VaultWithValue } from 'blockchain/vaults.types'
import { ethers } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { loadStrategyFromTokens } from 'features/aave'
import type { PositionCreated } from 'features/aave/services'
import { calculateLiquidationPrice } from 'features/aave/services/calculate-liquidation-price'
import type { IStrategyConfig } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import { extractStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import type { ApiVault, ApiVaultsParams } from 'features/shared/vaultApi'
import { formatAddress } from 'helpers/formatters/format'
import { mapAaveLikeUrlSlug, mapAaveProtocol } from 'helpers/getAaveLikeStrategyUrl'
import { productToVaultType } from 'helpers/productToVaultType'
import { zero } from 'helpers/zero'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { checkIfAave, checkIfSpark, LendingProtocol } from 'lendingProtocols'
import type { AaveLikeProtocolData } from 'lendingProtocols/aave-like-common'
import type { AaveLikeServices } from 'lendingProtocols/aave-like-common/aave-like-services'
import { memoize } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import type { Position } from './positionsOverviewSummary'

type CreatePositionEnvironmentPropsType = {
  tickerPrices$: (tokens: string[]) => Observable<Tickers>
  context$: Observable<Context>
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>
  readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>
}

function makerPositionName(vault: VaultWithType): string {
  if (isMakerEarnPosition(vault)) {
    return `${vault.ilk} Summer.fi Earn`
  } else if (vault.type === 'borrow') {
    return `${vault.ilk} Summer.fi Borrow`
  } else {
    return `${vault.ilk} Summer.fi Multiply`
  }
}

export function isMakerEarnPosition(vault: VaultWithType): boolean {
  return (
    vault.type === 'multiply' &&
    (vault.token === 'GUNIV3DAIUSDC1' || vault.token === 'GUNIV3DAIUSDC2')
  )
}

export function createMakerPositions$(
  vaultsWithValue$: (address: string) => Observable<VaultWithValue<VaultWithType>[]>,
  address: string,
): Observable<Position[]> {
  return vaultsWithValue$(address).pipe(
    map((vaults) => {
      return vaults.map((vault) => {
        return {
          token: vault.token,
          contentsUsd: vault.value,
          title: makerPositionName(vault),
          url: `/ethereum/maker/${vault.id}`,
        }
      })
    }),
  )
}

export type AaveLikePosition = Position & {
  debt: BigNumber
  netValue: BigNumber
  liquidationPrice: BigNumber
  liquidationPriceToken: string
  variableBorrowRate: BigNumber
  fundingCost: BigNumber
  lockedCollateral: BigNumber
  id: string
  multiple: BigNumber
  riskRatio: IRiskRatio
  isOwner: boolean
  type: 'borrow' | 'multiply' | 'earn'
  liquidity: BigNumber
  stopLossData?: StopLossTriggerData
  autoSellData?: AutoBSTriggerData // this is just for type safety in positions table, its not happening right now
  fakePositionCreatedEvtForDsProxyUsers?: boolean
  debtToken: string
  protocol: AaveLikeLendingProtocol
  chainId: NetworkIds
  isAtRiskDanger: boolean
  isAtRiskWarning: boolean
}

export function createPositions$(
  makerPositions$: (address: string) => Observable<Position[]>,
  aaveV2MainnetPositions$: (address: string) => Observable<Position[]>,
  aaveV3MainnetPositions$: (address: string) => Observable<Position[]>,
  optimismPositions$: (address: string) => Observable<Position[]>,
  arbitrumPositions$: (address: string) => Observable<Position[]>,

  address: string,
): Observable<Position[]> {
  const _makerPositions$ = makerPositions$(address)
  const _aaveV2Positions$ = aaveV2MainnetPositions$(address)
  const _aaveV3Positions$ = aaveV3MainnetPositions$(address)
  const _optimismPositions$ = optimismPositions$(address)
  const _arbitrumPositions$ = arbitrumPositions$(address)
  return combineLatest(
    _makerPositions$,
    _aaveV2Positions$,
    _aaveV3Positions$,
    _optimismPositions$,
    _arbitrumPositions$,
  ).pipe(
    map(
      ([
        makerPositions,
        aaveV2Positions,
        aaveV3MainnetPositions,
        optimismPositions,
        arbitrumPositions,
      ]) => {
        return [
          ...makerPositions,
          ...aaveV2Positions,
          ...aaveV3MainnetPositions,
          ...optimismPositions,
          ...arbitrumPositions,
        ]
      },
    ),
  )
}

type ProxyAddressesProvider = {
  dsProxy$: (walletAddress: string) => Observable<string | undefined>
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]>
}

type BuildPositionArgs = {
  aaveV2: AaveLikeServices
  tickerPrices$: (tokens: string[]) => Observable<Tickers>
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>
}

function buildAaveViewModel(
  positionCreatedEvent: PositionCreated & { fakePositionCreatedEvtForDsProxyUsers?: boolean },
  positionId: string,
  context: Context,
  walletAddress: string,
  observables: BuildPositionArgs,
): Observable<AaveLikePosition | undefined> {
  const { collateralTokenSymbol, debtTokenSymbol, proxyAddress, protocol, chainId } =
    positionCreatedEvent

  if (!checkIfAave(protocol)) {
    return of(undefined)
  }

  const resolvedAaveServices = observables.aaveV2

  return combineLatest(
    resolvedAaveServices.aaveLikeProtocolData$(
      collateralTokenSymbol,
      debtTokenSymbol,
      proxyAddress,
    ),
    resolvedAaveServices.getAaveLikeAssetsPrices$({
      tokens: [collateralTokenSymbol, debtTokenSymbol],
    }),
    observables.tickerPrices$([debtTokenSymbol]),
    resolvedAaveServices.getAaveLikeReserveData$({ token: debtTokenSymbol }),
    resolvedAaveServices.aaveLikeAvailableLiquidityInUSDC$({
      token: debtTokenSymbol,
    }),
    isAddress(positionId)
      ? of(undefined)
      : observables.automationTriggersData$(new BigNumber(positionId)),
  ).pipe(
    map(
      ([protocolData, assetPrices, tickerPrices, preparedAaveReserve, liquidity, triggersData]) => {
        const { position } = protocolData
        const isDebtZero = position.debt.amount.isZero()

        const oracleCollateralTokenPriceInEth = assetPrices[0]
        const oracleDebtTokenPriceInEth = assetPrices[1]

        const collateralToken = positionCreatedEvent.collateralTokenSymbol
        const debtToken = positionCreatedEvent.debtTokenSymbol

        const collateralNotWei = amountFromPrecision(
          position.collateral.amount,
          new BigNumber(position.collateral.precision),
        )
        const debtNotWei = amountFromPrecision(
          position.debt.amount,
          new BigNumber(position.debt.precision),
        )

        const netValueInEthAccordingToOracle = collateralNotWei
          .times(oracleCollateralTokenPriceInEth)
          .minus(debtNotWei.times(oracleDebtTokenPriceInEth))

        const liquidationPrice = !isDebtZero
          ? debtNotWei.div(collateralNotWei.times(position.category.liquidationThreshold))
          : zero

        const variableBorrowRate = preparedAaveReserve.variableBorrowRate

        const fundingCost = !isDebtZero
          ? debtNotWei
              .times(oracleDebtTokenPriceInEth)
              .div(netValueInEthAccordingToOracle)
              .multipliedBy(variableBorrowRate)
              .times(100)
          : zero

        // Todo: move to lib
        const netValueInDebtToken = amountFromPrecision(
          position.collateral.normalisedAmount
            .times(position.oraclePriceForCollateralDebtExchangeRate)
            .minus(position.debt.normalisedAmount),
          new BigNumber(18),
        )

        const netValueUsd = netValueInDebtToken.times(tickerPrices[position.debt.symbol])

        const isOwner = context.status === 'connected' && context.account === walletAddress

        const title = `${collateralToken}/${debtToken} Aave ${
          protocol === LendingProtocol.AaveV2 ? 'V2' : 'V3 Mainnet'
        }`

        const { loanToValue } = position.riskRatio
        const { maxLoanToValue } = position.category
        const warnignThreshold = maxLoanToValue.minus(maxLoanToValue.times(0.03))

        const isDanger = loanToValue.gte(maxLoanToValue)
        const isWarning = loanToValue.gte(warnignThreshold)

        return {
          token: collateralToken,
          debtToken,
          title: title,
          url: `/ethereum/aave/${mapAaveProtocol(protocol)}/${positionId}`, //TODO: Proper network handling
          id: isAddress(positionId) ? formatAddress(positionId) : positionId,
          netValue: netValueUsd,
          multiple: position.riskRatio.multiple,
          riskRatio: position.riskRatio,
          debt: debtNotWei,
          liquidationPrice,
          liquidationPriceToken: debtToken,
          fundingCost,
          variableBorrowRate,
          contentsUsd: netValueUsd,
          isOwner,
          lockedCollateral: collateralNotWei,
          type: mappymap[positionCreatedEvent.positionType],
          liquidity: liquidity,
          stopLossData: triggersData ? extractStopLossData(triggersData) : undefined,
          protocol,
          chainId,
          isAtRiskDanger: isDanger,
          isAtRiskWarning: isWarning,
        }
      },
    ),
  )
}

function buildAaveLikeV3OnlyViewModel(
  positionCreatedEvent: PositionCreated,
  positionId: string,
  walletAddress: string,
  isOwner: boolean,
  services: AaveLikeServices,
  strategyConfig: IStrategyConfig,
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData | undefined>,
  tickerPrices$: (tokens: string[]) => Observable<Tickers>,
): Observable<AaveLikePosition | undefined> {
  const { collateralTokenSymbol, debtTokenSymbol, proxyAddress, protocol, chainId } =
    positionCreatedEvent

  if (!checkIfAave(protocol) && !checkIfSpark(protocol)) {
    return of(undefined)
  }

  return combineLatest(
    services.aaveLikeProtocolData$(
      strategyConfig.tokens.collateral,
      strategyConfig.tokens.debt,
      proxyAddress,
    ),
    services.getAaveLikeAssetsPrices$({
      tokens: [collateralTokenSymbol, debtTokenSymbol],
    }),
    tickerPrices$([debtTokenSymbol]),
    services.getAaveLikeReserveData$({ token: debtTokenSymbol }),
    services.aaveLikeAvailableLiquidityInUSDC$({
      token: debtTokenSymbol,
    }),
    automationTriggersData$(new BigNumber(positionId)),
  ).pipe(
    map(
      ([protocolData, assetPrices, tickerPrices, preparedAaveReserve, liquidity, triggersData]) => {
        const { position } = protocolData
        const isDebtZero = position.debt.amount.isZero()

        const oracleCollateralTokenPriceInEth = assetPrices[0]
        const oracleDebtTokenPriceInEth = assetPrices[1]

        const collateralToken = positionCreatedEvent.collateralTokenSymbol
        const debtToken = positionCreatedEvent.debtTokenSymbol

        const collateralNotWei = amountFromPrecision(
          position.collateral.amount,
          new BigNumber(position.collateral.precision),
        )
        const debtNotWei = amountFromPrecision(
          position.debt.amount,
          new BigNumber(position.debt.precision),
        )

        const netValueInEthAccordingToOracle = collateralNotWei
          .times(oracleCollateralTokenPriceInEth)
          .minus(debtNotWei.times(oracleDebtTokenPriceInEth))

        const { liquidationPriceInCollateral, liquidationPriceInDebt } = calculateLiquidationPrice({
          collateral: position.collateral,
          debt: position.debt,
          liquidationRatio: position.category.liquidationThreshold,
        })

        const liquidationPrice =
          strategyConfig.strategyType === StrategyType.Long
            ? liquidationPriceInDebt
            : liquidationPriceInCollateral

        const liquidationPriceToken =
          strategyConfig.strategyType === StrategyType.Long ? debtToken : collateralToken

        const variableBorrowRate = preparedAaveReserve.variableBorrowRate

        const fundingCost = !isDebtZero
          ? debtNotWei
              .times(oracleDebtTokenPriceInEth)
              .div(netValueInEthAccordingToOracle)
              .multipliedBy(variableBorrowRate)
              .times(100)
          : zero

        // Todo: move to lib
        const netValueInDebtToken = amountFromPrecision(
          position.collateral.normalisedAmount
            .times(position.oraclePriceForCollateralDebtExchangeRate)
            .minus(position.debt.normalisedAmount),
          new BigNumber(18),
        )

        const netValueUsd = netValueInDebtToken.times(tickerPrices[position.debt.symbol])

        const title = `${collateralToken}/${debtToken} Aave ${
          protocol === LendingProtocol.AaveV2 ? 'V2' : `V3 ${strategyConfig.network}`
        }`

        const { loanToValue } = position.riskRatio
        const { liquidationThreshold } = position.category
        const { maxLoanToValue } = position.category
        const warnignThreshold = maxLoanToValue.minus(maxLoanToValue.times(3))

        const isDanger = loanToValue.gte(liquidationThreshold)
        const isWarning = loanToValue.gte(warnignThreshold)

        return {
          token: collateralToken,
          debtToken,
          title: title,
          url: `/${strategyConfig.network}/${mapAaveLikeUrlSlug(protocol)}/${mapAaveProtocol(
            protocol,
          )}/${positionId}`,
          id: positionId,
          netValue: netValueUsd,
          multiple: position.riskRatio.multiple,
          riskRatio: position.riskRatio,
          debt: debtNotWei,
          liquidationPrice,
          liquidationPriceToken,
          fundingCost,
          contentsUsd: netValueUsd,
          isOwner,
          lockedCollateral: collateralNotWei,
          type: mappymap[strategyConfig.type],
          liquidity: liquidity,
          stopLossData: triggersData ? extractStopLossData(triggersData) : undefined,
          protocol,
          chainId,
          variableBorrowRate,
          isAtRiskDanger: isDanger,
          isAtRiskWarning: isWarning,
        }
      },
    ),
  )
}

type FakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition = PositionCreated & {
  fakePositionCreatedEvtForDsProxyUsers?: boolean
}

function getStethEthAaveV2DsProxyEarnPosition$(
  proxyAddressesProvider: ProxyAddressesProvider,
  aaveLikeProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveLikeProtocolData>,
  walletAddress: string,
): Observable<FakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition[]> {
  return proxyAddressesProvider.dsProxy$(walletAddress).pipe(
    switchMap((dsProxyAddress) => {
      if (!dsProxyAddress) {
        return of([])
      }

      return aaveLikeProtocolData$('STETH', 'ETH', dsProxyAddress).pipe(
        map((avp) => {
          if (avp && avp.position.collateral.amount.gt(zero)) {
            return [
              {
                collateralTokenSymbol: 'STETH',
                debtTokenSymbol: 'ETH',
                positionType: 'Earn',
                protocol: LendingProtocol.AaveV2,
                chainId: NetworkIds.MAINNET,
                proxyAddress: dsProxyAddress,
                fakePositionCreatedEvtForDsProxyUsers: true,
                collateralTokenAddress: ethers.constants.AddressZero,
                debtTokenAddress: ethers.constants.AddressZero,
              },
            ]
          } else {
            return []
          }
        }),
      )
    }),
  )
}

// TODO we will need proper handling for Ajna, filtered for now
const sumAaveArray = [LendingProtocol.AaveV2, LendingProtocol.AaveV3]

export function createAaveV2Position$(
  proxyAddressesProvider: ProxyAddressesProvider,
  environment: CreatePositionEnvironmentPropsType,
  aaveV2: AaveLikeServices,
  walletAddress: string,
): Observable<AaveLikePosition[]> {
  const { context$, tickerPrices$, readPositionCreatedEvents$, automationTriggersData$ } =
    environment
  return context$.pipe(
    switchMap((context) => {
      return context.chainId !== NetworkIds.GOERLI
        ? combineLatest(
            proxyAddressesProvider.userDpmProxies$(walletAddress),
            getStethEthAaveV2DsProxyEarnPosition$(
              proxyAddressesProvider,
              aaveV2.aaveLikeProtocolData$,
              walletAddress,
            ),
          ).pipe(
            switchMap(
              ([dpmProxiesData, fakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition]) => {
                // if we have a DS proxy make a fake position created event so we can read any position out below
                const userProxiesData = [
                  ...dpmProxiesData,
                  ...fakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition.map(
                    (fakeEvent) => {
                      return {
                        user: walletAddress,
                        proxy: fakeEvent.proxyAddress,
                        vaultId: walletAddress,
                      }
                    },
                  ),
                ]
                return readPositionCreatedEvents$(walletAddress).pipe(
                  map((positionCreatedEvents) => {
                    return [
                      ...positionCreatedEvents,
                      ...fakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition,
                    ]
                  }),
                  switchMap((positionCreatedEvents) => {
                    return combineLatest(
                      positionCreatedEvents
                        .filter((event) => sumAaveArray.includes(event.protocol))
                        .map((pce) => {
                          const userProxy = userProxiesData.find(
                            (userProxy) => userProxy.proxy === pce.proxyAddress,
                          )
                          if (!userProxy) {
                            throw new Error('nope')
                          }

                          return buildAaveViewModel(
                            pce,
                            userProxy.vaultId,

                            context,
                            walletAddress,
                            {
                              aaveV2,
                              tickerPrices$,
                              automationTriggersData$,
                            },
                          )
                        }),
                    )
                  }),
                )
              },
            ),
            map((positions) => positions.filter((position) => position !== undefined)),
            startWith([]),
          )
        : of([] as AaveLikePosition[])
    }),
  )
}

const createAaveV3LikeDpmPosition = memoize(
  (protocol: LendingProtocol) =>
    (
      context$: Observable<Pick<Context, 'account'>>,
      userDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]>,
      tickerPrices$: (tokens: string[]) => Observable<Tickers>,
      readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>,
      getApiVaults: (params: ApiVaultsParams) => Promise<ApiVault[]>,
      automationTriggersData$: (id: BigNumber) => Observable<TriggersData | undefined>,
      services: AaveLikeServices,
      networkId: NetworkIds,
      walletAddress: string,
    ): Observable<AaveLikePosition[]> => {
      return combineLatest(
        context$,
        userDpmProxies$(walletAddress),
        readPositionCreatedEvents$(walletAddress),
      ).pipe(
        switchMap(async ([{ account }, userDpmProxies, positionCreatedEvents]) => {
          const vaultIds = userDpmProxies
            .map((userProxy) => userProxy.vaultId)
            .map((id) => Number.parseInt(id))
          const apiVaults = await getApiVaults({
            vaultIds,
            chainId: networkId,
            protocol,
          })

          return {
            account,
            userDpmProxies,
            positionCreatedEvents,
            apiVaults,
          }
        }),
        switchMap(({ account, userDpmProxies, positionCreatedEvents, apiVaults }) => {
          const subjects$ = positionCreatedEvents
            .map((pce) => {
              const network = getNetworkById(networkId)
              if (!network) {
                console.warn(
                  `Given network is not supported right now. Can't display Aaave V3 Position on network ${networkId}`,
                )
                return null
              }

              const dpm = userDpmProxies.find((userProxy) => userProxy.proxy === pce.proxyAddress)

              const apiVault = dpm
                ? apiVaults.find((vault) => vault.vaultId === Number.parseInt(dpm.vaultId))
                : undefined

              let strategyConfig: IStrategyConfig | null = null
              try {
                strategyConfig = loadStrategyFromTokens(
                  pce.collateralTokenSymbol,
                  pce.debtTokenSymbol,
                  network.name,
                  protocol,
                  apiVault?.type ?? productToVaultType(pce.positionType),
                )
              } catch (e) {
                console.warn(`Can't get strategy config for position ${pce.proxyAddress}`, e)
              }

              return {
                event: pce,
                dpmProxy: userDpmProxies.find((userProxy) => userProxy.proxy === pce.proxyAddress),
                strategyConfig,
                isOwner: walletAddress === account,
              }
            })
            .filter(
              (
                value,
              ): value is {
                event: PositionCreated
                dpmProxy: UserDpmAccount
                strategyConfig: IStrategyConfig
                isOwner: boolean
              } => {
                return (
                  value !== null && value.dpmProxy !== undefined && value.strategyConfig !== null
                )
              },
            )
            .map(({ event, dpmProxy, strategyConfig, isOwner }) => {
              return buildAaveLikeV3OnlyViewModel(
                event,
                dpmProxy!.vaultId,
                walletAddress,
                isOwner,
                services,
                strategyConfig,
                automationTriggersData$,
                tickerPrices$,
              ).pipe(
                filter((position): position is AaveLikePosition => {
                  return position !== undefined
                }),
              )
            })
          return combineLatest(subjects$)
        }),
        startWith([] as AaveLikePosition[]),
      )
    },
)

export const createAaveV3DpmPosition$ = createAaveV3LikeDpmPosition(LendingProtocol.AaveV3)
export const createSparkV3DpmPosition$ = createAaveV3LikeDpmPosition(LendingProtocol.SparkV3)

const mappymap = {
  Borrow: 'borrow',
  Multiply: 'multiply',
  Earn: 'earn',
} as const
