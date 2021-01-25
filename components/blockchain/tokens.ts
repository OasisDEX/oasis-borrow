import bigInt from 'big-integer'
import { Currency } from 'components/atoms/currency'
import { $Int, Numeric } from 'components/atoms/numeric'
import * as Int from 'money-ts/lib/Integer'

interface BasicTokenDefinition<I extends string, U extends number> {
  iso: I
  unit: U
  currency: Currency<I, U>
}

type Erc20TokenDefinition<I extends string, U extends number> = BasicTokenDefinition<I, U> & {
  erc20: true
}

type UniV2LPTokenDefinition<I extends string, U extends number> = Erc20TokenDefinition<I, U> & {
  uniLP: true
}

type GenericTokenDefinition<I extends string, U extends number> =
  | BasicTokenDefinition<I, U>
  | Erc20TokenDefinition<I, U>
  | UniV2LPTokenDefinition<I, U>

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
  | Erc20TokenDefinition<'BAT', 18>
  | UniV2LPTokenDefinition<'UNIV2DAIETH', 18>

export type WadDAI = Currency<'DAI', 18>
export type RayDAI = Currency<'DAI', 27>
export type RadDai = Currency<'DAI', 45>

export const $WadDai = (a: Numeric) => new Currency('DAI', 27, $Int(a))
export const $RayDai = (a: Numeric) => new Currency('DAI', 27, $Int(a))
export const $RadDai = (a: Numeric) => new Currency('DAI', 45, $Int(a))

export type TokenCode = TokenDefinitions['iso']

export type TokenDefinition<T extends TokenCode> = Extract<
  TokenDefinitions,
  GenericTokenDefinition<T, any>
>

export type Tokens = TokenDefinitions['currency']

export type TokenUnit<T extends TokenCode> = Extract<
  TokenDefinitions,
  GenericTokenDefinition<T, any>
>['unit']

export type Token<T extends TokenCode> = Extract<
  TokenDefinitions,
  GenericTokenDefinition<T, any>
>['currency']

function tokenUnit<T extends TokenCode>(t: T): TokenUnit<T> {
  switch (t) {
    case 'USD':
    case 'GUSD':
      return 2
    case 'USDC':
    case 'USDT':
      return 6
    case 'WBTC':
    case 'RENBTC':
      return 8
    default:
      return 18
  }
}

function createTokenBuilder<T extends TokenCode>(t: T) {
  return (a: Int.Integer) => new Currency(t, tokenUnit(t), a)
}

export function $createTokenUnsafe<T extends TokenCode>(t: T, a: Numeric) {
  return createTokenBuilder(t)($Int(a))
}
