import { Discrete } from 'money-ts/lib/Discrete'
import { Integer } from 'money-ts/lib/Integer'
import { Natural } from 'money-ts/lib/Natural'

export class AbstractCurrency<U extends number, I extends string> {
  readonly _unit: U
  readonly _iso: I
  readonly _value: Discrete<I, U>

  constructor(unit: U, iso: I, amount: Integer) {
    this._unit = unit
    this._iso = iso
    this._value = new Discrete({ dimension: iso, unit }, amount)
  }
}

interface AbstractToken<I extends string, U extends number> {
  iso: I
  unit: U
  currency: AbstractCurrency<U, I>
}

interface AbstractIlk<I extends string, T extends AbstractToken<any, any>> {
  ilk: I
  token: T
}

type DAI = AbstractToken<'DAI', 18>
type USD = AbstractToken<'USD', 2>

type ETH = AbstractToken<'ETH', 18>
type WBTC = AbstractToken<'WBTC', 8>

export type Ilks =
  | AbstractIlk<'ETH-A', ETH>
  | AbstractIlk<'ETH-B', ETH>
  | AbstractIlk<'WBTC-A', WBTC>

export type Tokens = Ilks['token'] | DAI | USD

export type Iso = Tokens['iso']

export type Ilk = Ilks['ilk']

export type TokenByIlk<I extends Ilk> = Extract<Ilks, AbstractIlk<I, any>>['token']

export type TokenByIso<I extends Iso> = Extract<Tokens, AbstractToken<I, any>>

export type Collateral<I extends Ilk> = TokenByIlk<I>['currency']

export type Token<I extends Iso> = TokenByIso<I>['currency']

//type IsoOrIlk = Ilk | Iso
// export type Token<O extends IsoOrIlk> = O extends Iso
//   ? TokenByIso<O>['currency']
//   : O extends Ilk
//   ? TokenByIlk<O>['currency']
//   : never

declare const tA: Token<'DAI'>
//declare const tB: Token<'ETH-A'>
declare const tC: Token<'ETH'>

// antecedent : consequent
class Ratio<A, B> {
  readonly _antecedent: A
  readonly _consequent: B

  constructor(antecedent: A, consequent: B) {
    this._antecedent = antecedent
    this._consequent = consequent
  }
}

type Numerator = Integer
type Denominator = Natural

export class Fraction extends Ratio<Integer, Natural> {
  constructor(numerator: Numerator, denominator: Denominator) {
    super(numerator, denominator)
  }

  get numerator(): Numerator {
    return this._antecedent
  }

  get denominator(): Denominator {
    return this._consequent
  }
}

export class AbstractPrice<Base extends Token<Iso>, Quote extends Token<Iso>> extends Ratio<
  Base,
  Quote
> {
  constructor(base: Base, quote: Quote) {
    super(base, quote)
  }

  get base(): Base {
    return this._antecedent
  }

  get quote(): Quote {
    return this._consequent
  }
}

type Price<B extends Iso, Q extends Iso> = AbstractPrice<Token<B>, Token<Q>>

declare const aa: Price<'ETH', 'USD'>

export class PriceRatio<Base extends Iso, QuoteA extends Iso, QuoteB extends Iso> extends Ratio<
  Price<Base, QuoteA>,
  Price<Base, QuoteB>
> {
  constructor(antecedentPrice: Price<Base, QuoteA>, consequentPrice: Price<Base, QuoteB>) {
    super(antecedentPrice, consequentPrice)
  }

  get antecedentPrice(): Price<Base, QuoteA> {
    return this._antecedent
  }

  get consequentPrice(): Price<Base, QuoteB> {
    return this._consequent
  }

  get percentage(): string {
    return '100 %'
  }
}

export interface Urn<I extends Ilk> {
  collateral: Collateral<I> // ink
  normalizedDebt: Integer // art
}

type WadDAI = AbstractCurrency<18, 'DAI'>
type RayDAI = AbstractCurrency<27, 'DAI'>
type RadDai = AbstractCurrency<45, 'DAI'>

type iDAI = WadDAI | RayDAI | RadDai

export interface VatIlk<I extends Ilk> {
  _ilk: I
  normalizedIlkDebt: Integer // Art [wad]
  debtScalingFactor: Integer // rate [ray]
  maxDebtPerUnitCollateral: RayDAI // spot [ray]
  debtCeiling: RadDai // line [rad]
  debtFloor: RadDai // debtFloor [rad]
}

export interface SpotIlk<I extends Ilk> {
  _ilk: I
  priceFeedAddress: string
  liquidationRatio: PriceRatio<'USD', 'DAI', TokenByIlk<I>['iso']>
}

declare const cc: SpotIlk<'WBTC-A'>

export interface JugIlk<I extends Ilk> {
  _ilk: I
  stabilityFee: Fraction
  feeLastLevied: Date
}

export interface CatIlk<I extends Ilk> {
  _tag: I
  liquidatorAddress: string
  liquidationPenalty: Fraction
  maxDebtPerAuctionLot: RadDai
}

type CollateralPrice<I extends Ilk> = Price<'USD', TokenByIlk<I>['iso']>
type CollateralDebtPriceRatio<I extends Ilk> = PriceRatio<'USD', 'DAI', TokenByIlk<I>['iso']>

export interface Vault<I extends Ilk> {
  id: Natural
  address: string // urnAddress
  owner: string // proxy
  controller: string // owner of proxy
  token: TokenByIlk<I>
  iso: Iso
  ilk: I
  collateral: Collateral<I>
  unlockedCollateral: Collateral<I>
  collateralPrice: CollateralPrice<I>
  backingCollateral: Collateral<I>
  backingCollateralPrice: CollateralPrice<I>
  freeCollateral: Collateral<I>
  freeCollateralPrice: CollateralPrice<I>
  debt: RadDai
  normalizedDebt: Integer
  availableDebt: DAI
  availableIlkDebt: DAI
  liquidationRatio: CollateralDebtPriceRatio<I>
  collateralizationRatio: CollateralDebtPriceRatio<I>
  tokenOraclePrice: CollateralPrice<I>
  liquidationPrice: CollateralPrice<I>
  liquidationPenalty: Fraction
  stabilityFee: Fraction
  debtFloor: RadDai
}

declare const v: Vault<'WBTC-A'>

const xa = v.freeCollateralPrice
