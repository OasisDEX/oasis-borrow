import { Discrete } from 'money-ts/lib/Discrete'
import { Integer, wrap as wrapℤ, zero } from 'money-ts/lib/Integer'
import bigInt from 'big-integer'
import * as E from 'fp-ts/lib/Either'
import BigNumber from 'bignumber.js'
import { pipe } from 'fp-ts/function'

export type Numeric = bigInt.BigInteger | string | BigNumber

export function $parse(amount: Numeric): E.Either<Error, Integer> {
  if (bigInt.isInstance(amount)) {
    return E.right(wrapℤ(amount))
  }
  if (BigNumber.isBigNumber(amount) && (amount as BigNumber).isInteger()) {
    return E.right(wrapℤ(bigInt(amount.toString())))
  }
  if (typeof amount === 'string' && new BigNumber(amount).isInteger()) {
    return E.right(wrapℤ(bigInt(amount)))
  }
  return E.left(new Error('could not parse'))
}

export function $parseUnsafe(amount: Numeric): Integer {
  if (bigInt.isInstance(amount)) {
    return wrapℤ(amount)
  }
  if (BigNumber.isBigNumber(amount) && (amount as BigNumber).isInteger()) {
    return wrapℤ(bigInt(amount.toString()))
  }
  if (typeof amount === 'string' && new BigNumber(amount).isInteger()) {
    return wrapℤ(bigInt(amount))
  }
  throw new Error('could not parse')
}

export function $create<I extends string, U extends number>(
  u: U,
  i: I,
  a: Numeric,
): E.Either<Error, Currency<U, I>> {
  return pipe(
    $parse(a),
    E.map((v) => new Currency(u, i, v)),
  )
}

export function $createUnsafe<I extends string, U extends number>(
  u: U,
  i: I,
  a: Numeric,
): Currency<U, I> {
  const v = $parseUnsafe(a)
  return new Currency(u, i, v)
}

export class Currency<U extends number, I extends string> {
  readonly _unit: U
  readonly _iso: I
  readonly _value: Discrete<I, U>

  constructor(unit: U, iso: I, amount: Integer) {
    this._unit = unit
    this._iso = iso
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

  public add(c: Currency<U, I>): Currency<U, I> {
    return this
  }

  public toString() {
    return this._value.toString()
  }
}
