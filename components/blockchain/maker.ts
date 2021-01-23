import { Discrete } from 'money-ts/lib/Discrete'
import { Integer } from 'money-ts/lib/Integer'
import { Natural } from 'money-ts/lib/Natural'

// Fiat
type TD_USD = BasicTokenDefinition<'USD', 2>

// Native
type TD_ETH = BasicTokenDefinition<'ETH', 18>

// ERC20
type TD_DAI = Erc20TokenDefinition<'DAI', 18>
type TD_USDC = Erc20TokenDefinition<'USDC', 6>
type TD_TUSD = Erc20TokenDefinition<'TUSD', 18>
type TD_USDT = Erc20TokenDefinition<'USDT', 6>
type TD_GUSD = Erc20TokenDefinition<'GUSD', 2>
type TD_PAX = Erc20TokenDefinition<'PAX', 18>
type TD_WBTC = Erc20TokenDefinition<'WBTC', 8>
type TD_RENBTC = Erc20TokenDefinition<'RENBTC', 8>
type TD_KNC = Erc20TokenDefinition<'KNC', 18>
type TD_ZRX = Erc20TokenDefinition<'ZRX', 18>
type TD_MANA = Erc20TokenDefinition<'MANA', 18>
type TD_COMP = Erc20TokenDefinition<'COMP', 18>
type TD_LRC = Erc20TokenDefinition<'LRC', 18>
type TD_LINK = Erc20TokenDefinition<'LINK', 18>
type TD_YFI = Erc20TokenDefinition<'YFI', 18>
type TD_BAL = Erc20TokenDefinition<'BAL', 18>
type TD_UNI = Erc20TokenDefinition<'UNI', 18>
type TD_AAVE = Erc20TokenDefinition<'AAVE', 18>
type TD_BAT = Erc20TokenDefinition<'BAT', 18>

// UNI_LP TOKENs
type TD_UNIV2DAIETH = UniV2LPTokenDefinition<'UNIV2DAIETH', 18>

type TokenDefinitions =
  | TD_USD
  | TD_ETH
  | TD_DAI
  | TD_USDC
  | TD_TUSD
  | TD_USDT
  | TD_GUSD
  | TD_PAX
  | TD_WBTC
  | TD_RENBTC
  | TD_KNC
  | TD_ZRX
  | TD_MANA
  | TD_COMP
  | TD_LRC
  | TD_LINK
  | TD_YFI
  | TD_BAL
  | TD_UNI
  | TD_AAVE
  | TD_BAT
  | TD_UNIV2DAIETH

export type IsoCode = TokenDefinitions['iso']

type TokenDefinition<I extends IsoCode> = Extract<TokenDefinitions, AbstractTokenDefinition<I, any>>

interface AbstractIlk<I extends unknown, T extends unknown> {
  ilk: I
  token: T
}

export type Ilks =
  | AbstractIlk<'ETH-A', TokenDefinition<'ETH'>>
  | AbstractIlk<'ETH-B', TokenDefinition<'ETH'>>
  | AbstractIlk<'BAT-A', TokenDefinition<'BAT'>>
  | AbstractIlk<'USDC-A', TokenDefinition<'USDC'>>
  | AbstractIlk<'USDC-B', TokenDefinition<'USDC'>>
  | AbstractIlk<'USDT-A', TokenDefinition<'USDT'>>
  | AbstractIlk<'TUSD-A', TokenDefinition<'TUSD'>>
  | AbstractIlk<'GUSD-A', TokenDefinition<'GUSD'>>
  | AbstractIlk<'WBTC-A', TokenDefinition<'WBTC'>>
  | AbstractIlk<'PAXUSD-A', TokenDefinition<'PAX'>>
  | AbstractIlk<'WBTC-A', TokenDefinition<'WBTC'>>
  | AbstractIlk<'RENBTC-A', TokenDefinition<'RENBTC'>>
  | AbstractIlk<'WBTC-A', TokenDefinition<'WBTC'>>
  | AbstractIlk<'KNC-A', TokenDefinition<'KNC'>>
  | AbstractIlk<'ZRX-A', TokenDefinition<'ZRX'>>
  | AbstractIlk<'MANA-A', TokenDefinition<'MANA'>>
  | AbstractIlk<'COMP-A', TokenDefinition<'COMP'>>
  | AbstractIlk<'LINK-A', TokenDefinition<'LINK'>>
  | AbstractIlk<'YFI-A', TokenDefinition<'YFI'>>
  | AbstractIlk<'BAL-A', TokenDefinition<'BAL'>>
  | AbstractIlk<'UNI-A', TokenDefinition<'UNI'>>
  | AbstractIlk<'AAVE-A', TokenDefinition<'AAVE'>>
  | AbstractIlk<'UNIV2DAIETH-A', TokenDefinition<'UNIV2DAIETH'>>

export type Tokens = TokenDefinitions['currency']
export type Collaterals = Ilks['token']['currency']
export type Ilk = Ilks['ilk']

export type TokenByIlk<I extends Ilk> = Extract<Ilks, AbstractIlk<I, any>>['token']
export type TokenByIso<I extends IsoCode> = Extract<
  TokenDefinitions,
  AbstractTokenDefinition<I, any>
>

export type Collateral<I extends Ilk> = TokenByIlk<I>['currency']
export type Token<I extends IsoCode> = TokenByIso<I>['currency']

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

export class PriceRatio<
  Base extends IsoCode,
  QuoteA extends IsoCode,
  QuoteB extends IsoCode
> extends Ratio<Price<Base, QuoteA>, Price<Base, QuoteB>> {
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

type WadDAI = Currency<18, 'DAI'>
type RayDAI = Currency<27, 'DAI'>
type RadDai = Currency<45, 'DAI'>

type iDAI = WadDAI | RayDAI | RadDai

export interface VatIlk<I extends Ilk> {
  _ilk: I
  normalizedIlkDebt: Integer
  debtScalingFactor: Integer
  maxDebtPerUnitCollateral: RayDAI
  debtCeiling: RadDai
  debtFloor: RadDai
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
  /**
   * id: This is id
   *
   */
  id: Natural
  address: string
  owner: string
  controller: string
  token: TokenByIlk<I>
  iso: IsoCode
  ilk: I
  lockedCollateral: Collateral<I>
  unlockedCollateral: Collateral<I>
  collateralPrice: CollateralPrice<I>
  backingCollateral: Collateral<I>
  backingCollateralPrice: CollateralPrice<I>
  freeCollateral: Collateral<I>
  freeCollateralPrice: CollateralPrice<I>
  debt: RadDai
  normalizedDebt: Integer
  availableDebt: Token<'DAI'>
  availableIlkDebt: Token<'DAI'>
  liquidationRatio: CollateralDebtPriceRatio<I>
  collateralizationRatio: CollateralDebtPriceRatio<I>
  tokenOraclePrice: CollateralPrice<I>
  liquidationPrice: CollateralPrice<I>
  liquidationPenalty: Fraction
  stabilityFee: Fraction
  debtFloor: RadDai
}

declare const v: Vault<'WBTC-A'>
