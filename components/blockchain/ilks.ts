import { Numeric } from 'components/atoms/numeric'
import { Price } from 'components/atoms/price'
import { PriceRatio } from 'components/atoms/priceRatio'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { CatIlk, catIlks } from './calls/cat'
import { JugIlk, jugIlks } from './calls/jug'
import { SpotIlk, spotIlks } from './calls/spot'
import { VatIlk, vatIlks } from './calls/vat'
import { Token, TokenDefinition, TokenCode, $createTokenUnsafe } from './tokens'

interface IlkConstructor<I extends Ilk, T extends TokenCode> {
  ilk: I
  collateralDefinition: TokenDefinition<T>
}

export type Ilks =
  | IlkConstructor<'ETH-A', 'ETH'>
  | IlkConstructor<'ETH-B', 'ETH'>
  | IlkConstructor<'BAT-A', 'BAT'>
  | IlkConstructor<'USDC-A', 'USDC'>
  | IlkConstructor<'USDC-B', 'USDC'>
  | IlkConstructor<'USDT-A', 'USDT'>
  | IlkConstructor<'TUSD-A', 'TUSD'>
  | IlkConstructor<'GUSD-A', 'GUSD'>
  | IlkConstructor<'WBTC-A', 'WBTC'>
  | IlkConstructor<'PAXUSD-A', 'PAX'>
  | IlkConstructor<'WBTC-A', 'WBTC'>
  | IlkConstructor<'RENBTC-A', 'RENBTC'>
  | IlkConstructor<'WBTC-A', 'WBTC'>
  | IlkConstructor<'KNC-A', 'KNC'>
  | IlkConstructor<'ZRX-A', 'ZRX'>
  | IlkConstructor<'MANA-A', 'MANA'>
  | IlkConstructor<'COMP-A', 'COMP'>
  | IlkConstructor<'LINK-A', 'LINK'>
  | IlkConstructor<'YFI-A', 'YFI'>
  | IlkConstructor<'BAL-A', 'BAL'>
  | IlkConstructor<'UNI-A', 'UNI'>
  | IlkConstructor<'AAVE-A', 'AAVE'>
  | IlkConstructor<'UNIV2DAIETH-A', 'UNIV2DAIETH'>

export type Ilk = Ilks['ilk']

type CollateralDefinitions = Ilks['collateralDefinition']

type CollateralDefinition<I extends Ilk> = Extract<
  Ilks,
  IlkConstructor<I, any>
>['collateralDefinition']

type Collaterals = CollateralDefinitions['currency']

export type Collateral<I extends Ilk> = CollateralDefinition<I>['currency']

export type CollateralPrice<I extends Ilk> = Price<Collateral<I>, Token<'USD'>>
export type DebtPrice = Price<Token<'DAI'>, Token<'USD'>>

export type CollateralDebtPriceRatio<I extends Ilk> = PriceRatio<CollateralPrice<I>, DebtPrice>

// Probably don't want to rely on this string splitting
// but should be fine for now
export function collateralCode<I extends Ilk>(ilk: Ilk): CollateralDefinition<I>['iso'] {
  return ilk.split('-')[0] as CollateralDefinition<I>['iso']
}

export function $createCollateralUnsafe<I extends Ilk>(ilk: I, a: Numeric) {
  return $createTokenUnsafe(collateralCode(ilk), a) as Collateral<I>
}

export function $createDebtPrice(a: Numeric): DebtPrice {
  return new Price($createTokenUnsafe('DAI', a), $createTokenUnsafe('USD', '1'))
}

export function $createCollateralPrice<I extends Ilk>(ilk: I, a: Numeric): CollateralPrice<I> {
  return new Price($createCollateralUnsafe(ilk, a), $createTokenUnsafe('USD', '1'))
}

export function $createCollateralDebtPriceRatio<I extends Ilk>(
  ilk: I,
  a: Numeric,
): CollateralDebtPriceRatio<I> {
  return new PriceRatio(
    new Price($createCollateralUnsafe(ilk, a), $createTokenUnsafe('USD', '1')),
    new Price($createTokenUnsafe('DAI', '1'), $createTokenUnsafe('USD', '1')),
  )
}

export type IlkData<I extends Ilk> = VatIlk<I> & CatIlk<I> & SpotIlk<I> & JugIlk<I>

export function createIlks$<I extends Ilk>(
  vatIlks$: (ilk: I) => Observable<VatIlk<I>>,
  spotIlks$: (ilk: I) => Observable<SpotIlk<I>>,
  jugIlks$: (ilk: I) => Observable<JugIlk<I>>,
  catIlks$: (ilk: I) => Observable<CatIlk<I>>,
  ilk: I,
): Observable<IlkData<I>> {
  return combineLatest(vatIlks$(ilk), spotIlks$(ilk), jugIlks$(ilk), catIlks$(ilk)).pipe(
    switchMap(
      ([
        { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
        { priceFeedAddress, liquidationRatio },
        { stabilityFee, dateFeeLastLevied },
        { liquidatorAddress, liquidationPenalty, maxDebtPerAuctionLot },
      ]) =>
        of({
          ilk,
          normalizedIlkDebt,
          debtScalingFactor,
          maxDebtPerUnitCollateral,
          debtCeiling,
          debtFloor,
          priceFeedAddress,
          liquidationRatio,
          stabilityFee,
          dateFeeLastLevied,
          liquidatorAddress,
          liquidationPenalty,
          maxDebtPerAuctionLot,
        }),
    ),
  )
}
