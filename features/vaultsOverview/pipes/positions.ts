import { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { getNetworkById, NetworkIds } from 'blockchain/networks'
import { Tickers } from 'blockchain/prices'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { amountFromPrecision } from 'blockchain/utils'
import { VaultWithType, VaultWithValue } from 'blockchain/vaults'
import { ethers } from 'ethers'
import { isAddress } from 'ethers/lib/utils'
import { loadStrategyFromTokens } from 'features/aave'
import { PositionCreated } from 'features/aave/services'
import { IStrategyConfig } from 'features/aave/types'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import {
  extractStopLossData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { formatAddress } from 'helpers/formatters/format'
import { mapAaveProtocol } from 'helpers/getAaveStrategyUrl'
import { zero } from 'helpers/zero'
import { AaveLendingProtocol, checkIfAave, LendingProtocol } from 'lendingProtocols'
import { ProtocolData } from 'lendingProtocols/aaveCommon'
import { AaveServices } from 'lendingProtocols/aaveCommon/AaveServices'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import { Position } from './positionsOverviewSummary'

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

export type AavePosition = Position & {
  debt: BigNumber
  netValue: BigNumber
  liquidationPrice: BigNumber
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
  protocol: AaveLendingProtocol
  chainId: NetworkIds
  isAtRiskDanger: boolean
  isAtRiskWarning: boolean
}

export function createPositions$(
  makerPositions$: (address: string) => Observable<Position[]>,
  aavePositions$: (address: string) => Observable<Position[]>,
  optimismPositions$: (address: string) => Observable<Position[]>,
  address: string,
): Observable<Position[]> {
  const _makerPositions$ = makerPositions$(address)
  const _aavePositions$ = aavePositions$(address)
  const _optimismPositions$ = optimismPositions$(address)
  return combineLatest(_makerPositions$, _aavePositions$, _optimismPositions$).pipe(
    map(([makerPositions, aavePositions, optimismPositions]) => {
      return [...makerPositions, ...aavePositions, ...optimismPositions]
    }),
  )
}

type ProxyAddressesProvider = {
  dsProxy$: (walletAddress: string) => Observable<string | undefined>
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]>
}

type BuildPositionArgs = {
  aaveV2: AaveServices
  aaveV3: AaveServices
  tickerPrices$: (tokens: string[]) => Observable<Tickers>
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>
}

function buildAaveViewModel(
  positionCreatedEvent: PositionCreated & { fakePositionCreatedEvtForDsProxyUsers?: boolean },
  positionId: string,
  context: Context,
  walletAddress: string,
  observables: BuildPositionArgs,
): Observable<AavePosition | undefined> {
  const { collateralTokenSymbol, debtTokenSymbol, proxyAddress, protocol, chainId } =
    positionCreatedEvent
  const aaveServiceMap: Record<AaveLendingProtocol, AaveServices> = {
    [LendingProtocol.AaveV2]: observables.aaveV2,
    [LendingProtocol.AaveV3]: observables.aaveV3,
  }

  if (!checkIfAave(protocol)) {
    return of(undefined)
  }

  const resolvedAaveServices = aaveServiceMap[protocol]

  return combineLatest(
    resolvedAaveServices.aaveProtocolData$(collateralTokenSymbol, debtTokenSymbol, proxyAddress),
    resolvedAaveServices.getAaveAssetsPrices$({
      tokens: [collateralTokenSymbol, debtTokenSymbol],
    }),
    observables.tickerPrices$([debtTokenSymbol]),
    resolvedAaveServices.getAaveReserveData$({ token: debtTokenSymbol }),
    resolvedAaveServices.aaveAvailableLiquidityInUSDC$({
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

function buildAaveV3OnlyViewModel(
  positionCreatedEvent: PositionCreated,
  positionId: string,
  walletAddress: string,
  isOwner: boolean,
  services: AaveServices,
  strategyConfig: IStrategyConfig,
  tickerPrices$: (tokens: string[]) => Observable<Tickers>,
): Observable<AavePosition | undefined> {
  const { collateralTokenSymbol, debtTokenSymbol, proxyAddress, protocol, chainId } =
    positionCreatedEvent

  if (!checkIfAave(protocol)) {
    return of(undefined)
  }

  return combineLatest(
    services.aaveProtocolData$(collateralTokenSymbol, debtTokenSymbol, proxyAddress),
    services.getAaveAssetsPrices$({
      tokens: [collateralTokenSymbol, debtTokenSymbol],
    }),
    tickerPrices$([debtTokenSymbol]),
    services.getAaveReserveData$({ token: debtTokenSymbol }),
    services.aaveAvailableLiquidityInUSDC$({
      token: debtTokenSymbol,
    }),
  ).pipe(
    map(([protocolData, assetPrices, tickerPrices, preparedAaveReserve, liquidity]) => {
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
        url: `/${strategyConfig.network}/aave/${mapAaveProtocol(protocol)}/${positionId}`,
        id: positionId,
        netValue: netValueUsd,
        multiple: position.riskRatio.multiple,
        riskRatio: position.riskRatio,
        debt: debtNotWei,
        liquidationPrice,
        fundingCost,
        contentsUsd: netValueUsd,
        isOwner,
        lockedCollateral: collateralNotWei,
        type: mappymap[positionCreatedEvent.positionType],
        liquidity: liquidity,
        stopLossData: undefined,
        protocol,
        chainId,
        variableBorrowRate,
        isAtRiskDanger: isDanger,
        isAtRiskWarning: isWarning,
      }
    }),
  )
}

type FakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition = PositionCreated & {
  fakePositionCreatedEvtForDsProxyUsers?: boolean
}

function getStethEthAaveV2DsProxyEarnPosition$(
  proxyAddressesProvider: ProxyAddressesProvider,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<ProtocolData>,
  walletAddress: string,
): Observable<FakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition[]> {
  return proxyAddressesProvider.dsProxy$(walletAddress).pipe(
    switchMap((dsProxyAddress) => {
      if (!dsProxyAddress) {
        return of([])
      }

      return aaveProtocolData$('STETH', 'ETH', dsProxyAddress).pipe(
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

export function createAavePosition$(
  proxyAddressesProvider: ProxyAddressesProvider,
  environment: CreatePositionEnvironmentPropsType,
  aaveV2: AaveServices,
  aaveV3: AaveServices,
  walletAddress: string,
): Observable<AavePosition[]> {
  const { context$, tickerPrices$, readPositionCreatedEvents$, automationTriggersData$ } =
    environment
  return context$.pipe(
    switchMap((context) => {
      return context.chainId !== NetworkIds.GOERLI
        ? combineLatest(
            proxyAddressesProvider.userDpmProxies$(walletAddress),
            getStethEthAaveV2DsProxyEarnPosition$(
              proxyAddressesProvider,
              aaveV2.aaveProtocolData$,
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
                              aaveV3,
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
        : of([] as AavePosition[])
    }),
  )
}

export function createAaveDpmPosition$(
  context$: Observable<Pick<Context, 'account'>>,
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]>,
  tickerPrices$: (tokens: string[]) => Observable<Tickers>,
  readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>,
  aaveV3: AaveServices,
  networkId: NetworkIds,
  walletAddress: string,
) {
  return combineLatest(
    context$,
    userDpmProxies$(walletAddress),
    readPositionCreatedEvents$(walletAddress),
  ).pipe(
    switchMap(([{ account }, userDpmProxies, positionCreatedEvents]) => {
      const subjects$ = positionCreatedEvents
        .map((pce) => {
          const network = getNetworkById(networkId)
          if (!network) {
            console.warn(
              `Given network is not supported right now. Can't display Aaave V3 Position on network ${networkId}`,
            )
            return null
          }

          const strategyConfig = loadStrategyFromTokens(
            pce.collateralTokenSymbol,
            pce.debtTokenSymbol,
            network.name,
            LendingProtocol.AaveV3,
          )
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
            return value !== null && value.dpmProxy !== undefined
          },
        )
        .map(({ event, dpmProxy, strategyConfig, isOwner }) => {
          return buildAaveV3OnlyViewModel(
            event,
            dpmProxy!.vaultId,
            walletAddress,
            isOwner,
            aaveV3,
            strategyConfig,
            tickerPrices$,
          ).pipe(
            filter((position): position is AavePosition => {
              return position !== undefined
            }),
          )
        })
      return combineLatest(subjects$)
    }),
    startWith([] as AavePosition[]),
  )
}

const mappymap = {
  Borrow: 'borrow',
  Multiply: 'multiply',
  Earn: 'earn',
} as const
