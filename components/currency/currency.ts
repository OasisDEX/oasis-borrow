import { Discrete } from 'money-ts/lib/Discrete'
import { Integer, wrap } from 'money-ts/lib/Integer'
import bigInt from 'big-integer'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'

import BigNumber from 'bignumber.js'
import { pipe } from 'fp-ts/function'

export type Numeric = bigInt.BigInteger | string | BigNumber

export function $parseInteger(amount: Numeric): E.Either<Error, Integer> {
  if (bigInt.isInstance(amount)) {
    return E.right(wrap(amount))
  }
  if (BigNumber.isBigNumber(amount) && (amount as BigNumber).isInteger()) {
    return E.right(wrap(bigInt(amount.toString())))
  }
  if (typeof amount === 'string' && new BigNumber(amount).isInteger()) {
    return E.right(wrap(bigInt(amount)))
  }
  return E.left(new Error('could not parse'))
}

export function $parseIntegerUnsafe(amount: Numeric): Integer {
  if (bigInt.isInstance(amount)) {
    return wrap(amount)
  }
  if (BigNumber.isBigNumber(amount) && (amount as BigNumber).isInteger()) {
    return wrap(bigInt(amount.toString()))
  }
  if (typeof amount === 'string' && new BigNumber(amount).isInteger()) {
    return wrap(bigInt(amount))
  }
  throw new Error('could not parse')
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

  public add(c: Currency<U, I>): Currency<U, I> {
    return this
  }

  public toString() {
    return this._value.toString()
  }
}
