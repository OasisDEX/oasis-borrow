import { CatIlkData, catIlks } from 'components/blockchain/calls/cat'
import { JugIlkData, jugIlks } from 'components/blockchain/calls/jug'
import { CallObservable } from 'components/blockchain/calls/observe'
import { SpotIlkData, spotIlks } from 'components/blockchain/calls/spot'
import { VatIlkData, vatIlks } from 'components/blockchain/calls/vat'
import { Currency } from 'components/currency/currency'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

interface DAI {
  iso: 'DAI'
  unit: 18
}

interface ETH {
  iso: 'ETH'
  unit: 18
}

interface WBTC {
  iso: 'WBTC'
  unit: 8
}

type CollateralToken = 'ETH' | 'WBTC'

type CollateralTokenInfo<CollateralToken> = CollateralToken extends 'ETH'
  ? ETH
  : CollateralToken extends 'WBTC'
  ? WBTC
  : never

export const collateralTokenInfo: Dictionary<
  CollateralTokenInfo<CollateralToken>,
  CollateralToken
> = {
  ETH: {
    iso: 'ETH',
    unit: 18,
  },
  WBTC: {
    iso: 'WBTC',
    unit: 8,
  },
}

type Token = CollateralToken | 'DAI'

type TokenInfo<Token> = Token extends 'DAI' ? DAI : CollateralTokenInfo<Token>

export const tokenInfo: Dictionary<TokenInfo<Token>, Token> = {
  ...collateralTokenInfo,
  DAI: {
    iso: 'DAI',
    unit: 18,
  },
}

export type Ilk = 'ETH-A' | 'ETH-B' | 'WBTC-A'

export const collateralTokenInfoByIlk: Dictionary<CollateralTokenInfo<CollateralToken>, Ilk> = {
  'ETH-A': collateralTokenInfo['ETH'],
  'ETH-B': collateralTokenInfo['ETH'],
  'WBTC-A': collateralTokenInfo['WBTC'],
}

export type Collateral<T extends Ilk> = T extends 'ETH-A'
  ? Currency<18, 'ETH'>
  : T extends 'ETH-B'
  ? Currency<18, 'ETH'>
  : T extends 'WBTC-A'
  ? Currency<8, 'WBTC'>
  : never

export type IlkData<Ilk> = VatIlkData & SpotIlkData<Ilk> & JugIlkData<Ilk> & CatIlkData<Ilk>

export function createIlks$(
  vatIlks$: CallObservable<typeof vatIlks>,
  spotIlks$: CallObservable<typeof spotIlks>,
  jugIlks$: CallObservable<typeof jugIlks>,
  catIlks$: CallObservable<typeof catIlks>,
  ilk: Ilk,
): Observable<IlkData<Ilk>> {
  return combineLatest(vatIlks$(ilk), spotIlks$(ilk), jugIlks$(ilk), catIlks$(ilk)).pipe(
    switchMap(
      ([
        { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
        { priceFeedAddress, liquidationRatio },
        { stabilityFee, feeLastLevied },
        { liquidatorAddress, liquidationPenalty, maxAuctionLotSize },
      ]) =>
        of({
          normalizedIlkDebt,
          debtScalingFactor,
          maxDebtPerUnitCollateral,
          debtCeiling,
          debtFloor,
          priceFeedAddress,
          liquidationRatio,
          stabilityFee,
          feeLastLevied,
          liquidatorAddress,
          liquidationPenalty,
          maxAuctionLotSize,
        }),
    ),
  )
}
