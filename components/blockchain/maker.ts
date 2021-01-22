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

interface BasicTokenDefinition<I extends string, U extends number> {
  iso: I
  unit: U
  amount: AbstractCurrency<U, I>
}

type Erc20TokenDefinition<I extends string, U extends number> = BasicTokenDefinition<I, U> & {
  erc20: true
}

type UniV2LPTokenDefinition<I extends string, U extends number> = Erc20TokenDefinition<I, U> & {
  uniLp: true
}

type AbstractTokenDefinition<I extends string, U extends number> =
  | BasicTokenDefinition<I, U>
  | Erc20TokenDefinition<I, U>
  | Erc721TokenDefinition<I, U>
  | UniV2LPTokenDefinition<I, U>

// export const defaultCdpTypes = [
//   { currency: ETH, ilk: 'ETH-A' },
//   { currency: ETH, ilk: 'ETH-B' },
//   { currency: BAT, ilk: 'BAT-A' },
//   { currency: USDC, ilk: 'USDC-A', decimals: 6 },
//   { currency: PAXUSD, ilk: 'PAXUSD-A', decimals: 18 },
//   { currency: USDT, ilk: 'USDT-A', decimals: 6 },
//   { currency: USDC, ilk: 'USDC-B', decimals: 6 },
//   { currency: TUSD, ilk: 'TUSD-A', decimals: 18 },
//   { currency: GUSD, ilk: 'GUSD-A', decimals: 2 },

//   { currency: WBTC, ilk: 'WBTC-A', decimals: 8 },
//   { currency: RENBTC, ilk: 'RENBTC-A', decimals: 8 },

//   { currency: KNC, ilk: 'KNC-A', decimals: 18 },
//   { currency: ZRX, ilk: 'ZRX-A', decimals: 18 },
//   { currency: MANA, ilk: 'MANA-A', decimals: 18 },
//   { currency: COMP, ilk: 'COMP-A', decimals: 18 },
//   { currency: LRC, ilk: 'LRC-A', decimals: 18 },
//   { currency: LINK, ilk: 'LINK-A', decimals: 18 },
//   { currency: YFI, ilk: 'YFI-A', decimals: 18 },
//   { currency: BAL, ilk: 'BAL-A', decimals: 18 },
//   { currency: UNI, ilk: 'UNI-A', decimals: 18 },
//   { currency: AAVE, ilk: 'AAVE-A', decimals: 18 },
//   { currency: UNIV2DAIETH, ilk: 'UNIV2DAIETH-A', decimals: 18 },
// ]

type TokenDefinitions =
  | BasicTokenDefinition<'USD', 2>
  | BasicTokenDefinition<'ETH', 18>
  | Erc20TokenDefinition<'DAI', 18>
  | Erc20TokenDefinition<'USDC', 6>
  | Erc20TokenDefinition<'TUSD', 18>
  | Erc20TokenDefinition<'USDT', 6>
  | Erc20TokenDefinition<'GUSD', 2>
  | Erc20TokenDefinition<'PAX', 18>
  | Erc20TokenDefinition<'WBTC', 8>
  | Erc20TokenDefinition<'RENBTC', 8>
  | Erc20TokenDefinition<'KNC', 18>
  | Erc20TokenDefinition<'ZRX', 18>
  | Erc20TokenDefinition<'MANA', 18>
  | Erc20TokenDefinition<'COMP', 18>
  | Erc20TokenDefinition<'LRC', 18>
  | Erc20TokenDefinition<'LINK', 18>
  | Erc20TokenDefinition<'YFI', 18>
  | Erc20TokenDefinition<'BAL', 18>
  | Erc20TokenDefinition<'UNI', 18>
  | Erc20TokenDefinition<'AAVE', 18>
  | UniV2LPTokenDefinition<'UNIV2DAIETH', 18>

export type TokenIsoCodes = TokenDefinitions['iso']
export type TokenUnits = TokenDefinitions['unit']

interface AbstractIlk<I extends string, T extends AbstractTokenDefinition<any, any>> {
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

const cx = v.collateralizationRatio
const x = cx.consequentPrice
