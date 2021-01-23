import { Discrete } from 'money-ts/lib/Discrete'
import { Integer } from 'money-ts/lib/Integer'

export class Currency<U extends number, I extends string> {
  readonly _unit: U
  readonly _iso: I
  readonly _value: Discrete<I, U>

  constructor(unit: U, iso: I, amount: Integer) {
    this._unit = unit
    this._iso = iso
    this._value = new Discrete({ dimension: iso, unit }, amount)
  }
}

export type _<U extends number, I extends string> = Currency<U, I>

export interface BasicTokenDefinition<I extends string, U extends number> {
  iso: I
  unit: U
  currency: _<U, I>
}

export type Erc20TokenDefinition<I extends string, U extends number> = BasicTokenDefinition<
  I,
  U
> & {
  erc20: true
}

export type UniV2LPTokenDefinition<I extends string, U extends number> = Erc20TokenDefinition<
  I,
  U
> & {
  uniLp: true
}

export type GenericTokenDefinition<I extends string, U extends number> =
  | BasicTokenDefinition<I, U>
  | Erc20TokenDefinition<I, U>
  | UniV2LPTokenDefinition<I, U>
