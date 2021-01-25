import { Discrete } from 'money-ts/lib/Discrete'
import { Integer } from 'money-ts/lib/Integer'

export class Currency<I extends string, U extends number> {
  readonly _unit: U
  readonly _iso: I
  readonly _value: Discrete<I, U>

  constructor(iso: I, unit: U, amount: Integer) {
    this._unit = unit
    this._iso = iso
    this._value = new Discrete({ dimension: iso, unit }, amount)
  }

  toString(): string {
    return this._value.toString()
  }
}
