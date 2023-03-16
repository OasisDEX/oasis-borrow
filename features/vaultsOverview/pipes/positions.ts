import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { amountFromPrecision } from 'blockchain/utils'
import { VaultWithType, VaultWithValue } from 'blockchain/vaults'
import { ProtocolsServices } from 'components/AppContext'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { positionIdIsAddress } from 'features/aave/types'
import { TriggersData } from 'features/automation/api/automationTriggersData'
import {
  extractStopLossData,
  StopLossTriggerData,
} from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { formatAddress } from 'helpers/formatters/format'
import { mapAaveProtocol } from 'helpers/getAaveStrategyUrl'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { AaveProtocolData as AaveProtocolDataV2 } from 'lendingProtocols/aave-v2/pipelines'
import { AaveProtocolData as AaveProtocolDataV3 } from 'lendingProtocols/aave-v3/pipelines'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { Position } from './positionsOverviewSummary'

type CreatePositionEnvironmentPropsType = {
  tickerPrices$: (tokens: string[]) => Observable<Tickers>
  context$: Observable<Context>
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>
  readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>
}

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
  debtToken: string
  protocol: LendingProtocol.AaveV2 | LendingProtocol.AaveV3
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
  aaveV2: ProtocolsServices[LendingProtocol.AaveV2]
  aaveV3: ProtocolsServices[LendingProtocol.AaveV3]
  tickerPrices$: (tokens: string[]) => Observable<Tickers>
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>
}

function buildAaveViewModel(
  positionCreatedEvent: PositionCreated & { fakePositionCreatedEvtForDsProxyUsers?: boolean },
  positionId: string,
  context: Context,
  walletAddress: string,
  observables: BuildPositionArgs,
): Observable<AavePosition> {
  const { collateralTokenSymbol, debtTokenSymbol, proxyAddress, protocol } = positionCreatedEvent
  const aaveServiceMap = {
    [LendingProtocol.AaveV2]: observables.aaveV2,
    [LendingProtocol.AaveV3]: observables.aaveV3,
  }
  const resolvedAaveServices = aaveServiceMap[protocol]
  return combineLatest(
    // using properAaveMethods.aaveProtocolData causes this to lose strict typings
    protocol === LendingProtocol.AaveV2
      ? observables.aaveV2.aaveProtocolData$(collateralTokenSymbol, debtTokenSymbol, proxyAddress)
      : observables.aaveV3.aaveProtocolData$(collateralTokenSymbol, debtTokenSymbol, proxyAddress),
    resolvedAaveServices.getAaveAssetsPrices$({
      tokens: [collateralTokenSymbol, debtTokenSymbol],
    }),
    observables.tickerPrices$([debtTokenSymbol]),
    resolvedAaveServices.wrappedGetAaveReserveData$(debtTokenSymbol),
    resolvedAaveServices.aaveAvailableLiquidityInUSDC$({
      token: debtTokenSymbol,
    }),
    positionIdIsAddress(positionId)
      ? of(undefined)
      : observables.automationTriggersData$(new BigNumber(positionId)),
  ).pipe(
    map(
      ([protocolData, assetPrices, tickerPrices, preparedAaveReserve, liquidity, triggersData]) => {
        const { position } = protocolData as AaveProtocolDataV2 | AaveProtocolDataV3

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

        const title = `${collateralToken}/${debtToken}`

        return {
          token: collateralToken,
          debtToken: debtToken,
          title: title,
          url: `/aave/${mapAaveProtocol(protocol)}/${positionId}`,
          id: positionIdIsAddress(positionId) ? formatAddress(positionId) : positionId,
          netValue: netValueUsd,
          multiple: position.riskRatio.multiple,
          liquidationPrice,
          fundingCost,
          contentsUsd: netValueUsd,
          isOwner,
          lockedCollateral: collateralNotWei,
          type: mappymap[positionCreatedEvent.positionType],
          liquidity: liquidity,
          stopLossData: triggersData ? extractStopLossData(triggersData) : undefined,
          protocol,
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
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveProtocolDataV2>,
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

// TODO we will need proper handling for Ajna, filtered for now
const sumAaveArray = [LendingProtocol.AaveV2, LendingProtocol.AaveV3]

export function createAavePosition$(
  proxyAddressesProvider: ProxyAddressesProvider,
  environment: CreatePositionEnvironmentPropsType,
  aaveV2: ProtocolsServices[LendingProtocol.AaveV2],
  aaveV3: ProtocolsServices[LendingProtocol.AaveV3],
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
    getStethEthAaveV2DsProxyEarnPosition$(
      proxyAddressesProvider,
      aaveV2.aaveProtocolData$,
      walletAddress,
    ),
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
              positionCreatedEvents
                .filter((event) => sumAaveArray.includes(event.protocol))
                .map((pce) => {
                  const userProxy = userProxiesData.find(
                    (userProxy) => userProxy.proxy === pce.proxyAddress,
                  )
                  if (!userProxy) {
                    throw new Error('nope')
                  }

                  return buildAaveViewModel(pce, userProxy.vaultId, context, walletAddress, {
                    aaveV2,
                    aaveV3,
                    tickerPrices$,
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
