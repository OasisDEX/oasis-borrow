import BigNumber from 'bignumber.js'
import { AaveV2AssetsPricesParameters } from 'blockchain/aave/aaveV2PriceOracle'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { amountFromPrecision } from 'blockchain/utils'
import { VaultWithType, VaultWithValue } from 'blockchain/vaults'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import {
  extractStopLossData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { PositionId, positionIdIsAddress } from 'features/aave/types'
import { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { formatAddress } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { AaveProtocolData, PreparedAaveReserveData } from 'lendingProtocols/aave-v2/pipelines'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { Position } from './positionsOverviewSummary'

function makerPositionName(vault: VaultWithType): string {
  if (isMakerEarnPosition(vault)) {
    return `${vault.ilk} Oasis Earn`
  } else if (vault.type === 'borrow') {
    return `${vault.ilk} Oasis Borrow`
  } else {
    return `${vault.ilk} Oasis Multiply`
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
          url: `/${vault.id}`,
        }
      })
    }),
  )
}

export function decorateAaveTokensPrice$(
  collateralTokens$: Observable<string[]>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
): Observable<{ token: string; tokenPrice: BigNumber }[]> {
  return collateralTokens$.pipe(
    switchMap((tokens) => {
      const tokens$ = tokens.map((token) => {
        const defaultQuoteAmount = new BigNumber(100)
        return exchangeQuote$(
          token,
          new BigNumber(0.005),
          defaultQuoteAmount,
          'BUY_COLLATERAL', // should be SELL_COLLATERAL but the manage multiply pipe uses BUY, and we want the values the same.
          'defaultExchange',
        ).pipe(
          map((quote) => {
            return {
              token,
              tokenPrice: quote.status === 'SUCCESS' ? quote.tokenPrice : new BigNumber(0),
            }
          }),
        )
      })
      return tokens$.length === 0 ? of([]) : combineLatest(tokens$)
    }),
  )
}

export type AavePosition = Position & {
  netValue: BigNumber
  liquidationPrice: BigNumber
  fundingCost: BigNumber
  lockedCollateral: BigNumber
  id: string
  multiple: BigNumber
  isOwner: boolean
  type: 'borrow' | 'multiply' | 'earn'
  liquidity: BigNumber
  stopLossData?: StopLossTriggerData
  fakePositionCreatedEvtForDsProxyUsers?: boolean
}

export function createPositions$(
  makerPositions$: (address: string) => Observable<Position[]>,
  aavePositions$: (address: string) => Observable<Position[]>,
  address: string,
): Observable<Position[]> {
  const _makerPositions$ = makerPositions$(address)
  const _aavePositions$ = aavePositions$(address)
  return combineLatest(_makerPositions$, _aavePositions$).pipe(
    map(([makerPositions, aavePositions]) => {
      return [...makerPositions, ...aavePositions]
    }),
  )
}

type ProxyAddressesProvider = {
  dsProxy$: (walletAddress: string) => Observable<string | undefined>
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]>
}

type BuildPositionArgs = {
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveProtocolData>
  getAaveAssetsPrices$: (args: AaveV2AssetsPricesParameters) => Observable<BigNumber[]>
  tickerPrices$: (tokens: string[]) => Observable<Tickers>
  wrappedGetAaveReserveData$: (token: string) => Observable<PreparedAaveReserveData>
  aaveAvailableLiquidityInUSDC$: (reserveDataParameters: { token: string }) => Observable<BigNumber>
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>
}

function buildPosition(
  positionCreatedEvent: PositionCreated & { fakePositionCreatedEvtForDsProxyUsers?: boolean },
  positionId: string,
  context: Context,
  walletAddress: string,
  observables: BuildPositionArgs,
): Observable<AavePosition> {
  const { collateralTokenSymbol, debtTokenSymbol, proxyAddress } = positionCreatedEvent
  return combineLatest(
    observables.aaveProtocolData$(collateralTokenSymbol, debtTokenSymbol, proxyAddress),
    observables.getAaveAssetsPrices$({
      tokens: [collateralTokenSymbol, debtTokenSymbol],
    }),
    observables.tickerPrices$([collateralTokenSymbol, debtTokenSymbol]),
    observables.wrappedGetAaveReserveData$(debtTokenSymbol),
    observables.aaveAvailableLiquidityInUSDC$({
      token: debtTokenSymbol,
    }),
    positionIdIsAddress(positionId)
      ? of(undefined)
      : observables.automationTriggersData$(new BigNumber(positionId)),
  ).pipe(
    map(
      ([protocolData, assetPrices, tickerPrices, preparedAaveReserve, liquidity, triggersData]) => {
        const {
          position: {
            riskRatio: { multiple },
            debt,
            collateral,
            category: { liquidationThreshold },
          },
        } = protocolData

        const isDebtZero = debt.amount.isZero()

        const tickerCollateralTokenPriceInUsd = tickerPrices[collateral.symbol]
        const tickerDebtTokenPriceInUsd = tickerPrices[debt.symbol]

        const oracleCollateralTokenPriceInEth = assetPrices[0]
        const oracleDebtTokenPriceInEth = assetPrices[1]

        const collateralToken = positionCreatedEvent.collateralTokenSymbol
        const debtToken = positionCreatedEvent.debtTokenSymbol

        const collateralNotWei = amountFromPrecision(
          collateral.amount,
          new BigNumber(collateral.precision),
        )
        const debtNotWei = amountFromPrecision(debt.amount, new BigNumber(debt.precision))

        const netValueInEthAccordingToOracle = collateralNotWei
          .times(oracleCollateralTokenPriceInEth)
          .minus(debtNotWei.times(oracleDebtTokenPriceInEth))

        const liquidationPrice = !isDebtZero
          ? debtNotWei.div(collateralNotWei.times(liquidationThreshold))
          : zero

        const variableBorrowRate = preparedAaveReserve.variableBorrowRate

        const fundingCost = !isDebtZero
          ? debtNotWei
              .times(oracleDebtTokenPriceInEth)
              .div(netValueInEthAccordingToOracle)
              .multipliedBy(variableBorrowRate)
              .times(100)
          : zero

        const netValueUsd = collateralNotWei
          .times(tickerCollateralTokenPriceInUsd)
          .minus(debtNotWei.times(tickerDebtTokenPriceInUsd))

        const isOwner = context.status === 'connected' && context.account === walletAddress

      return {
        token: collateralToken,
        title: `${collateralToken}/${debtToken} AAVE`,
        url: `/aave/${positionId}`,
        id: positionIdIsAddress(positionId) ? formatAddress(positionId) : positionId,
        netValue: netValueUsd,
        multiple,
        liquidationPrice,
        fundingCost,
        contentsUsd: netValueUsd,
        isOwner,
        lockedCollateral: collateralNotWei,
        type: mappymap[positionCreatedEvent.positionType],
        liquidity: liquidity,
        stopLossData: triggersData ? extractStopLossData(triggersData) : undefined,
      }
    }),
  )
}

type FakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition = PositionCreated & {
  fakePositionCreatedEvtForDsProxyUsers?: boolean
}

function hasStethEthAaveV2DsProxyEarnPosition$(
  proxyAddressesProvider: ProxyAddressesProvider,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveProtocolData>,
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
                protocol: 'AAVE',
                proxyAddress: dsProxyAddress,
                fakePositionCreatedEvtForDsProxyUsers: true,
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

export function createAavePosition$(
  proxyAddressesProvider: ProxyAddressesProvider,
  environment: {
    tickerPrices$: (tokens: string[]) => Observable<Tickers>
    context$: Observable<Context>
    automationTriggersData$: (id: BigNumber) => Observable<TriggersData>
    readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>
  },
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveProtocolData>,
  getAaveAssetsPrices$: (args: AaveV2AssetsPricesParameters) => Observable<BigNumber[]>,
  wrappedGetAaveReserveData$: (token: string) => Observable<PreparedAaveReserveData>,
  aaveAvailableLiquidityInUSDC$: (reserveDataParameters: {
    token: string
  }) => Observable<BigNumber>,
  getStrategyConfig$: (positionId: PositionId) => Observable<IStrategyConfig>,
  walletAddress: string,
): Observable<AavePosition[]> {
  const {
    context$,
    tickerPrices$,
    readPositionCreatedEvents$,
    automationTriggersData$,
  } = environment
  return combineLatest(
    proxyAddressesProvider.userDpmProxies$(walletAddress),
    hasStethEthAaveV2DsProxyEarnPosition$(proxyAddressesProvider, aaveProtocolData$, walletAddress),
    context$,
  ).pipe(
    switchMap(
      ([dpmProxiesData, fakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition, context]) => {
        // if we have a DS proxy make a fake position created event so we can read any position out below
        const userProxiesData = [
          ...dpmProxiesData,
          ...fakePositionCreatedEventForStethEthAaveV2DsProxyEarnPosition.map((fakeEvent) => {
            return {
              user: walletAddress,
              proxy: fakeEvent.proxyAddress,
              vaultId: walletAddress,
            }
          }),
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
              positionCreatedEvents.map((pce) => {
                const userProxy = userProxiesData.find(
                  (userProxy) => userProxy.proxy === pce.proxyAddress,
                )
                if (!userProxy) {
                  throw new Error('nope')
                }

                return buildPosition(pce, userProxy.vaultId, context, walletAddress, {
                  aaveProtocolData$,
                  getAaveAssetsPrices$,
                  tickerPrices$,
                  wrappedGetAaveReserveData$,
                  aaveAvailableLiquidityInUSDC$,
                  automationTriggersData$,
                })
              }),
            )
          }),
        )
      },
    ),
    startWith([]),
  )
}

const mappymap = {
  Borrow: 'borrow',
  Multiply: 'multiply',
  Earn: 'earn',
} as const
