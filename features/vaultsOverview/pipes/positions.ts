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
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { AaveProtocolData } from 'features/aave/manage/services'
import { zero } from 'helpers/zero'
import { combineLatest, concat, EMPTY, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap, toArray } from 'rxjs/operators'

import { ExchangeAction, ExchangeType, Quote } from '../../exchange/exchange'
import { Position } from './positionsOverviewSummary'
import { PositionId } from '../../aave/types'

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

export function createAaveDpmPosition$(
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmProxy[]>,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveProtocolData>,
  strategyConfig$: (position: PositionId) => Observable<IStrategyConfig>,
  getAaveAssetsPrices$: (args: AaveAssetsPricesParameters) => Observable<BigNumber[]>,
  wrappedGetAaveReserveData$: (token: string) => Observable<PreparedAaveReserveData>,
  context$: Observable<Context>,
  walletAddress: string,
): Observable<AaveDpmPosition[]> {
  return combineLatest(userDpmProxies$(walletAddress), context$).pipe(
    switchMap(([userProxiesData, context]) => {
      return combineLatest(
        userProxiesData.map((proxyData) => strategyConfig$({ walletAddress })),
      ).pipe(
        switchMap((strategyConfig) => {
          const protocolDataObservableList = strategyConfig.map(
            ({ tokens: { collateral, debt } }, index) =>
              aaveProtocolData$(collateral, debt, userProxiesData[index].proxy),
          )
          const assetPricesListObservableList = strategyConfig.map(
            ({ tokens: { collateral, debt } }) =>
              getAaveAssetsPrices$({
                tokens: [debt, collateral],
              }),
          )

          const wrappedGetAaveReserveDataObservableList = strategyConfig.map(
            ({ tokens: { debt } }) => wrappedGetAaveReserveData$(debt),
          )

          return combineLatest(
            concat(...protocolDataObservableList).pipe(toArray()),
            concat(...assetPricesListObservableList).pipe(toArray()),
            concat(...wrappedGetAaveReserveDataObservableList).pipe(toArray()),
          ).pipe(
            switchMap(([protocolDataList, assetPricesList, preparedAaveReserveData]) => {
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
                  const collateralTokenPrice = assetPricesList[index][0]
                  const debtTokenPrice = assetPricesList[index][1]
                  const token = strategyConfig[index].tokens.collateral
                  const debtToken = strategyConfig[index].tokens.debt

                  const netValue = collateral.amount
                    .times(collateralTokenPrice)
                    .minus(debt.amount.times(debtTokenPrice))

                  const liquidationPrice = !isDebtZero
                    ? debt.amount.div(collateral.amount.times(liquidationThreshold))
                    : zero

                  const variableBorrowRate = preparedAaveReserveData[index].variableBorrowRate

                  const fundingCost = !isDebtZero
                    ? debt.amount
                        .times(debtTokenPrice)
                        .div(netValue)
                        .multipliedBy(variableBorrowRate)
                        .times(100)
                    : zero

                  const isOwner =
                    context.status === 'connected' && context.account === walletAddress

                  return {
                    token,
                    title: `${token}/${debtToken} AAVE`,
                    url: `/aave/${userProxiesData[index].vaultId}`,
                    id: userProxiesData[index].vaultId,
                    netValue,
                    multiple,
                    liquidationPrice,
                    fundingCost,
                    contentsUsd: netValue,
                    isOwner,
                  }
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
