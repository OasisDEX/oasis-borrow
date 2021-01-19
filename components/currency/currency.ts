import { Discrete } from 'money-ts/lib/Discrete'
import { Integer, wrap as wrapℤ, zero } from 'money-ts/lib/Integer'
import bigInt from 'big-integer'
import { none, some, Option } from 'fp-ts/Option'
import { curry } from 'ramda'

type Numeric = bigInt.BigInteger | string

export function _createCurrency<I extends string, U extends number>(
  iso: I,
  unit: U,
  amount: Numeric,
): Option<Currency<I, U>> {
  // if possible serialise as an Integer
  if (bigInt.isInstance(amount)) {
    const v = new Currency(iso, unit, wrapℤ(amount))
    return some(v)
  }
  return none
}

export const $create = curry(_createCurrency)

export class Currency<I extends string, U extends number> {
  readonly _iso: I
  readonly _unit: U
  readonly _value: Discrete<I, U>

  constructor(iso: I, unit: U, amount: Integer) {
    this._iso = iso
    this._unit = unit
    this._value = new Discrete({ dimension: iso, unit }, amount)
  }

  // private _parseAsInteger(v: Numeric): Integer {
  //   if (typeof v === 'string') {
  //     // if v is string just try convert to bignumber
  //     return integerWrap(bigInt(v))
  //   }
  //   if (BigNumber.isBigNumber(v) && (v as BigNumber).isInteger() && !(v as BigNumber).isNaN()) {
  //     return integerWrap(bigInt(v.toString()))
  //   }
  //   if (Number.isSafeInteger(v)) {
  //     return integerWrap(bigInt(v.toString()))
  //   }
  //   if (bigInt.isInstance(v)) {
  //     return integerWrap(v)
  //   }

  //   throw new Error('could not parse as integer')
  // }

  public add(c: Currency<I, U>): Currency<I, U> {
    return this
  }

  public toString() {
    return this._value.toString()
  }
}
