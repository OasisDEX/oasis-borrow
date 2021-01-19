import BigNumber from 'bignumber.js'
import { Discrete } from 'money-ts/lib/Discrete'
import { Integer, wrap as integerWrap, zero } from 'money-ts/lib/Integer'
import bigInt from 'big-integer'

type Numeric = BigInteger | string

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
