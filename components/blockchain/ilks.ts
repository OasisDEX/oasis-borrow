import { Fraction } from 'components/atoms/fraction'
import { Price } from 'components/atoms/price'
import { PriceRatio } from 'components/atoms/priceRatio'
import { Integer } from 'money-ts/lib/Integer'
import { combineLatest, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { RadDai, RayDAI, Token, TokenDefinition, TokenCode } from './tokens'

interface IlkConstructor<I extends Ilk, T extends TokenCode> {
  ilk: I
  collateralDefinition: TokenDefinition<T>
  // normalizedIlkDebt: Integer
  // debtScalingFactor: Integer
  // maxDebtPerUnitCollateral: RayDAI
  // debtCeiling: RadDai
  // debtFloor: RadDai
  // liquidatorAddress: string
  // liquidationPenalty: Fraction
  // maxDebtPerAuctionLot: RadDai
  // priceFeedAddress: string
  // liquidationRatio: CollateralDebtPriceRatio<I>
  // stabilityFee: Fraction
  // feeLastLevied: Date
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

export type CollateralPrice<I extends Ilk> = Price<Token<'USD'>, Collateral<I>>
export type DebtPrice = Price<Token<'USD'>, Token<'DAI'>>

export type CollateralDebtPriceRatio<I extends Ilk> = PriceRatio<CollateralPrice<I>, DebtPrice>

interface VatIlk<I extends Ilk> {
  ilk: I
  normalizedIlkDebt: Integer
  debtScalingFactor: Integer
  maxDebtPerUnitCollateral: RayDAI
  debtCeiling: RadDai
  debtFloor: RadDai
}

interface CatIlk<I extends Ilk> {
  ilk: I
  liquidatorAddress: string
  liquidationPenalty: Fraction
  maxDebtPerAuctionLot: RadDai
}

interface SpotIlk<I extends Ilk> {
  ilk: I
  priceFeedAddress: string
  liquidationRatio: CollateralDebtPriceRatio<I>
}

interface JugIlk<I extends Ilk> {
  ilk: I
  stabilityFee: Fraction
  feeLastLevied: Date
}

export type IlkData<I extends Ilk> = VatIlk<I> & CatIlk<I> & SpotIlk<I> & JugIlk<I>

// export function createIlks$(
//   vatIlks$: CallObservable<typeof vatIlks>,
//   spotIlks$: CallObservable<typeof spotIlks>,
//   jugIlks$: CallObservable<typeof jugIlks>,
//   catIlks$: CallObservable<typeof catIlks>,
//   ilk: Ilk,
// ): Observable<IlkDefinition<Ilk>> {
//   return combineLatest(vatIlks$(ilk), spotIlks$(ilk), jugIlks$(ilk), catIlks$(ilk)).pipe(
//     switchMap(
//       ([
//         { normalizedIlkDebt, debtScalingFactor, maxDebtPerUnitCollateral, debtCeiling, debtFloor },
//         { priceFeedAddress, liquidationRatio },
//         { stabilityFee, feeLastLevied },
//         { liquidatorAddress, liquidationPenalty, maxAuctionLotSize },
//       ]) =>
//         of({
//           normalizedIlkDebt,
//           debtScalingFactor,
//           maxDebtPerUnitCollateral,
//           debtCeiling,
//           debtFloor,
//           priceFeedAddress,
//           liquidationRatio,
//           stabilityFee,
//           feeLastLevied,
//           liquidatorAddress,
//           liquidationPenalty,
//           maxAuctionLotSize,
//         }),
//     ),
//   )
// }
