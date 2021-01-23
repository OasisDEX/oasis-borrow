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
