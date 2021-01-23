import { Currency } from 'components/atoms/currency'

type _<U extends number, I extends string> = Currency<U, I>

interface BasicTokenDefinition<I extends string, U extends number> {
  iso: I
  unit: U
  currency: _<U, I>
}

type Erc20TokenDefinition<I extends string, U extends number> = BasicTokenDefinition<I, U> & {
  erc20: true
}

type UniV2LPTokenDefinition<I extends string, U extends number> = Erc20TokenDefinition<I, U> & {
  uniLp: true
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

export type TokenCode = TokenDefinitions['iso']

export type TokenDefinition<T extends TokenCode> = Extract<
  TokenDefinitions,
  GenericTokenDefinition<T, any>
>

export type Tokens = TokenDefinitions['currency']
export type Token<T extends TokenCode> = Extract<
  TokenDefinitions,
  GenericTokenDefinition<T, any>
>['currency']

export type WadDAI = Currency<18, 'DAI'>
export type RayDAI = Currency<27, 'DAI'>
export type RadDai = Currency<45, 'DAI'>
