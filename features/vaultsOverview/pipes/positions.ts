import BigNumber from 'bignumber.js'
import { AaveAssetsPricesParameters } from 'blockchain/calls/aave/aavePriceOracle'
import { Context } from 'blockchain/network'
import { UserDpmProxy } from 'blockchain/userDpmProxies'
import { VaultWithType, VaultWithValue } from 'blockchain/vaults'
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { AaveProtocolData } from 'features/aave/manage/services'
import { zero } from 'helpers/zero'
import { combineLatest, Observable, of } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import { Tickers } from '../../../blockchain/prices'
import { amountFromPrecision } from '../../../blockchain/utils'
import { formatAddress } from '../../../helpers/formatters/format'
import { IStrategyConfig } from '../../aave/common/StrategyConfigTypes'
import { PositionCreated } from '../../aave/services/readPositionCreatedEvents'
import { PositionId, positionIdIsAddress } from '../../aave/types'
import { ExchangeAction, ExchangeType, Quote } from '../../exchange/exchange'
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
  type: 'multiply' | 'earn'
  liquidity: BigNumber
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

type ProxyAddresses = {
  dsProxy$: (walletAddress: string) => Observable<string | undefined>
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmProxy[]>
}

export function createAavePosition$(
  proxyAddresses: ProxyAddresses,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveProtocolData>,
  getAaveAssetsPrices$: (args: AaveAssetsPricesParameters) => Observable<BigNumber[]>,
  tickerPrices$: (tokens: string[]) => Observable<Tickers>,
  wrappedGetAaveReserveData$: (token: string) => Observable<PreparedAaveReserveData>,
  context$: Observable<Context>,
  readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreated[]>,
  aaveAvailableLiquidityInUSDC$: (reserveDataParameters: {
    token: string
  }) => Observable<BigNumber>,
  getStrategyConfig$: (positionId: PositionId) => Observable<IStrategyConfig>,
  walletAddress: string,
): Observable<AavePosition[]> {
  return combineLatest(
    proxyAddresses.userDpmProxies$(walletAddress),
    proxyAddresses.dsProxy$(walletAddress),
    getStrategyConfig$({ walletAddress }),
    context$,
  ).pipe(
    switchMap(([userProxiesData, dsProxyAddress, strategyConfig, context]) => {
      // if we have a DS proxy make a fake position created event so we can read any position out below
      let dsFakeEvent: PositionCreated[] = []
      if (dsProxyAddress) {
        dsFakeEvent = [
          {
            collateralTokenSymbol: strategyConfig.tokens.collateral,
            debtTokenSymbol: strategyConfig.tokens.debt,
            positionType: strategyConfig.type,
            proxyAddress: dsProxyAddress,
            protocol: 'AAVE',
          },
        ]

        userProxiesData = [
          ...userProxiesData,
          {
            user: walletAddress,
            proxy: dsProxyAddress,
            vaultId: walletAddress,
          },
        ]
      }

      return readPositionCreatedEvents$(walletAddress).pipe(
        map((positionCreatedEvents) => {
          return [...positionCreatedEvents, ...dsFakeEvent]
        }),
        switchMap((positionCreatedEvents) => {
          const protocolDataObservableList = positionCreatedEvents.map(
            ({ collateralTokenSymbol, debtTokenSymbol, proxyAddress }) => {
              return aaveProtocolData$(collateralTokenSymbol, debtTokenSymbol, proxyAddress)
            },
          )

          const assetPricesListObservableList = positionCreatedEvents.map(
            ({ collateralTokenSymbol, debtTokenSymbol }) => {
              return getAaveAssetsPrices$({
                tokens: [collateralTokenSymbol, debtTokenSymbol],
              })
            },
          )

          const tickerPrices = positionCreatedEvents.map(
            ({ collateralTokenSymbol, debtTokenSymbol }) => {
              return tickerPrices$([collateralTokenSymbol, debtTokenSymbol])
            },
          )

          const wrappedGetAaveReserveDataObservableList = positionCreatedEvents.map(
            ({ debtTokenSymbol }) => {
              return wrappedGetAaveReserveData$(debtTokenSymbol)
            },
          )

          const liquidityObservables = positionCreatedEvents.map(({ debtTokenSymbol }) => {
            return aaveAvailableLiquidityInUSDC$({
              token: debtTokenSymbol,
            })
          })

          return combineLatest(
            combineLatest(...protocolDataObservableList),
            combineLatest(...assetPricesListObservableList),
            combineLatest(...tickerPrices),
            combineLatest(...wrappedGetAaveReserveDataObservableList),
            combineLatest(...liquidityObservables),
            of(positionCreatedEvents),
          ).pipe(
            map(
              ([
                protocolDataList,
                assetPricesList,
                tickerPrices,
                preparedAaveReserveData,
                liquidities,
                positionCreatedEvents,
              ]) => {
                const positions = protocolDataList.map(
                  (
                    {
                      position: {
                        riskRatio: { multiple },
                        debt,
                        collateral,
                        category: { liquidationThreshold },
                      },
                    },
                    index,
                  ) => {
                    const positionId = userProxiesData.find(
                      ({ proxy }) => proxy === positionCreatedEvents[index].proxyAddress,
                    )?.vaultId

                    if (!positionId) {
                      throw new Error(
                        `Could not find position ID for proxy address ${positionCreatedEvents[index].proxyAddress}`,
                      )
                    }

                    const isDebtZero = debt.amount.isZero()

                    const tickerCollateralTokenPriceInUsd = tickerPrices[index][collateral.symbol]
                    const tickerDebtTokenPriceInUsd = tickerPrices[index][debt.symbol]

                    const oracleCollateralTokenPriceInEth = assetPricesList[index][0]
                    const oracleDebtTokenPriceInEth = assetPricesList[index][1]

                    const liquidity = liquidities[index]

                    const collateralToken = positionCreatedEvents[index].collateralTokenSymbol
                    const debtToken = positionCreatedEvents[index].debtTokenSymbol

                    const collateralNotWei = amountFromPrecision(
                      collateral.amount,
                      new BigNumber(collateral.precision),
                    )
                    const debtNotWei = amountFromPrecision(
                      debt.amount,
                      new BigNumber(debt.precision),
                    )

                    const netValueInEthAccordingToOracle = collateralNotWei
                      .times(oracleCollateralTokenPriceInEth)
                      .minus(debtNotWei.times(oracleDebtTokenPriceInEth))

                    const liquidationPrice = !isDebtZero
                      ? debtNotWei.div(collateralNotWei.times(liquidationThreshold))
                      : zero

                    const variableBorrowRate = preparedAaveReserveData[index].variableBorrowRate

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

                    const isOwner =
                      context.status === 'connected' && context.account === walletAddress

                    const position: AavePosition = {
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
                      type: mappymap[positionCreatedEvents[index].positionType],
                      liquidity: liquidity,
                    }

                    return position
                  },
                )

                return positions
              },
            ),
          )
        }),
      )
    }),
    startWith([]),
  )
}

const mappymap = {
  Multiply: 'multiply',
  Earn: 'earn',
} as const
