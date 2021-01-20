import bigInt from 'big-integer'
import { CatIlkData, catIlks } from 'components/blockchain/calls/cat'
import { JugIlkData, jugIlks } from 'components/blockchain/calls/jug'
import { CallObservable } from 'components/blockchain/calls/observe'
import { SpotIlkData, spotIlks } from 'components/blockchain/calls/spot'
import { VatIlkData, vatIlks } from 'components/blockchain/calls/vat'
import { $create, $parse, Currency, Numeric } from 'components/currency/currency'
import * as E from 'fp-ts/lib/Either'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { pipe } from 'fp-ts/function'
import { Dictionary, PickProperties } from 'ts-essentials'

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

const collateralTokenInfo: Dictionary<CollateralTokenInfo<CollateralToken>, CollateralToken> = {
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

const tokenInfo: Dictionary<TokenInfo<Token>, Token> = {
  ...collateralTokenInfo,
  DAI: {
    iso: 'DAI',
    unit: 18,
  },
}

export type Ilk = 'ETH-A' | 'ETH-B' | 'WBTC-A'

const collateralTokenInfoByIlk: Dictionary<CollateralTokenInfo<CollateralToken>, Ilk> = {
  'ETH-A': collateralTokenInfo['ETH'],
  'ETH-B': collateralTokenInfo['ETH'],
  'WBTC-A': collateralTokenInfo['WBTC'],
}

export type Collateral<Ilk> = Ilk extends 'ETH-A'
  ? Currency<18, 'ETH'>
  : Ilk extends 'ETH-B'
  ? Currency<18, 'ETH'>
  : Ilk extends 'WBTC-A'
  ? Currency<8, 'WBTC'>
  : never

export function createCollateralByIlk(ilk: Ilk, amount: Numeric): E.Either<Error, Collateral<Ilk>> {
  const { iso, unit } = collateralTokenInfoByIlk[ilk]

  return pipe(
    $parse(amount),
    E.map((v) => new Currency(unit, iso, v) as Collateral<Ilk>),
  )
}

export type IlkData<Ilk> = VatIlkData<Ilk> & SpotIlkData<Ilk> & JugIlkData<Ilk> & CatIlkData<Ilk>

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
