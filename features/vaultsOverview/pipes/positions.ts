import BigNumber from 'bignumber.js'
import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
  MINIMAL_COLLATERAL,
} from 'blockchain/calls/aave/aaveLendingPool'
import { AaveAssetsPricesParameters } from 'blockchain/calls/aave/aavePriceOracle'
import { Context } from 'blockchain/network'
import { UserDpmProxy } from 'blockchain/userDpmProxies'
import { VaultWithType, VaultWithValue } from 'blockchain/vaults'
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { AaveProtocolData } from 'features/aave/manage/services'
import { zero } from 'helpers/zero'
import { findKey } from 'lodash'
import { combineLatest, EMPTY, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import { Tickers } from '../../../blockchain/prices'
import { amountFromPrecision } from '../../../blockchain/utils'
import { PositionCreatedEventPayload } from '../../aave/services/readPositionCreatedEvents'
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
  liquidity: BigNumber
  pln: string
  ownerAddress: string
}

export type AaveDpmPosition = Position & {
  netValue: BigNumber
  liquidationPrice: BigNumber
  fundingCost: BigNumber
  lockedCollateral: BigNumber
  id: string
  multiple: BigNumber
  isOwner: boolean
  type: 'multiply' | 'earn'
}

export function createAavePosition$(
  userAaveAccountData$: (
    parameters: AaveUserAccountDataParameters,
  ) => Observable<AaveUserAccountData>,
  aaveAvailableLiquidityETH$: Observable<BigNumber>,
  ethPrice$: Observable<BigNumber>,
  getUserProxyAddress$: (userAddress: string) => Observable<string | undefined>,
  address: string,
): Observable<AavePosition | undefined> {
  return combineLatest(getUserProxyAddress$(address), aaveAvailableLiquidityETH$, ethPrice$).pipe(
    switchMap(([proxyAddress, liquidity, ethPrice]) => {
      if (!proxyAddress) return EMPTY
      return userAaveAccountData$({ address: proxyAddress }).pipe(
        filter((accountData) => accountData.totalCollateralETH.gt(MINIMAL_COLLATERAL)),
        map((accountData) => {
          const netValue = accountData.totalCollateralETH
            .minus(accountData.totalDebtETH)
            .times(ethPrice)
          return {
            token: 'STETH',
            contentsUsd: netValue,
            title: 'AAVE-stETH-ETH',
            url: `/aave/${address}`,
            netValue: netValue,
            liquidity: liquidity,
            pln: 'N/A',
            ownerAddress: address,
          }
        }),
      )
    }),
    startWith(undefined),
  )
}

export function createPositions$(
  makerPositions$: (address: string) => Observable<Position[]>,
  aavePositions$: (address: string) => Observable<Position | undefined>,
  aaveDpmPositions$: (address: string) => Observable<Position[]>,
  address: string,
): Observable<Position[]> {
  const _makerPositions$ = makerPositions$(address)
  const _aavePositions$ = aavePositions$(address)
  const _aaveDpmPositions$ = aaveDpmPositions$(address)
  return combineLatest(_makerPositions$, _aavePositions$, _aaveDpmPositions$).pipe(
    map(([makerPositions, aavePosition, aaveDpmPositions]) => {
      return [...makerPositions, ...(aavePosition ? [aavePosition] : []), ...aaveDpmPositions]
    }),
  )
}

function getTokenFromAddress(context: Context, tokenAddress: string) {
  const token = findKey(context.tokens, (contractDesc) => contractDesc.address === tokenAddress)
  if (!token) {
    throw new Error(`could not find token for address ${tokenAddress}`)
  }

  return token
}

export function createAaveDpmPosition$(
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmProxy[]>,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveProtocolData>,
  getAaveAssetsPrices$: (args: AaveAssetsPricesParameters) => Observable<BigNumber[]>,
  tickerPrices$: (tokens: string[]) => Observable<Tickers>,
  wrappedGetAaveReserveData$: (token: string) => Observable<PreparedAaveReserveData>,
  context$: Observable<Context>,
  readPositionCreatedEvents$: (wallet: string) => Observable<PositionCreatedEventPayload[]>,
  walletAddress: string,
): Observable<AaveDpmPosition[]> {
  return combineLatest(userDpmProxies$(walletAddress), context$).pipe(
    switchMap(([userProxiesData, context]) => {
      return combineLatest(readPositionCreatedEvents$(walletAddress)).pipe(
        switchMap(([positionCreatedEvents]) => {
          const protocolDataObservableList = positionCreatedEvents.map(
            ({ collateralToken, debtToken }, index) => {
              const collateral = getTokenFromAddress(context, collateralToken)
              const debt = getTokenFromAddress(context, debtToken)
              return aaveProtocolData$(collateral, debt, userProxiesData[index].proxy)
            },
          )

          const assetPricesListObservableList = positionCreatedEvents.map(
            ({ collateralToken, debtToken }) => {
              const collateral = getTokenFromAddress(context, collateralToken)
              const debt = getTokenFromAddress(context, debtToken)
              return getAaveAssetsPrices$({
                tokens: [debt, collateral],
              })
            },
          )

          const tickerPrices = positionCreatedEvents.map(({ collateralToken, debtToken }) => {
            const collateral = getTokenFromAddress(context, collateralToken)
            const debt = getTokenFromAddress(context, debtToken)
            return tickerPrices$([collateral, debt])
          })

          const wrappedGetAaveReserveDataObservableList = positionCreatedEvents.map(
            ({ debtToken }) => {
              const debt = getTokenFromAddress(context, debtToken)
              return wrappedGetAaveReserveData$(debt)
            },
          )

          return combineLatest(
            combineLatest(...protocolDataObservableList),
            combineLatest(...assetPricesListObservableList),
            combineLatest(...tickerPrices),
            combineLatest(...wrappedGetAaveReserveDataObservableList),
          ).pipe(
            map(([protocolDataList, assetPricesList, tickerPrices, preparedAaveReserveData]) => {
              return protocolDataList.map(
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
                  const isDebtZero = debt.amount.isZero()

                  const tickerCollateralTokenPriceInUsd = tickerPrices[index][collateral.symbol]
                  const tickerDebtTokenPriceInUsd = tickerPrices[index][debt.symbol]

                  const oracleCollateralTokenPriceInEth = assetPricesList[index][0]
                  const oracleDebtTokenPriceInEth = assetPricesList[index][1]

                  const collateralToken = getTokenFromAddress(
                    context,
                    positionCreatedEvents[index].collateralToken,
                  )
                  const debtToken = getTokenFromAddress(
                    context,
                    positionCreatedEvents[index].debtToken,
                  )

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

                  const position: AaveDpmPosition = {
                    token: collateralToken,
                    title: `${collateralToken}/${debtToken} AAVE`,
                    url: `/aave/${userProxiesData[index].vaultId}`,
                    id: userProxiesData[index].vaultId,
                    netValue: netValueUsd,
                    multiple,
                    liquidationPrice,
                    fundingCost,
                    contentsUsd: netValueUsd,
                    isOwner,
                    lockedCollateral: collateralNotWei,
                    type: mappymap[positionCreatedEvents[index].positionType],
                  }

                  return position
                },
              )
            }),
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
