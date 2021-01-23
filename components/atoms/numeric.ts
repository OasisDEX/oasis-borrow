import bigInt from 'big-integer'
import { BigNumber } from 'bignumber.js'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { Integer, wrap as wrapInteger } from 'money-ts/lib/Integer'
import {
  Natural,
  wrap as wrapNatural,
  show as showNatural,
  fromInteger,
} from 'money-ts/lib/Natural'
import * as fn from 'fp-ts/function'

export type Numeric = bigInt.BigInteger | string | BigNumber

export function $parseInteger(amount: Numeric): E.Either<Error, Integer> {
  if (bigInt.isInstance(amount)) {
    return E.right(wrapInteger(amount))
  }
  if (BigNumber.isBigNumber(amount) && (amount as BigNumber).isInteger()) {
    return E.right(wrapInteger(bigInt(amount.toString())))
  }
  if (typeof amount === 'string' && new BigNumber(amount).isInteger()) {
    return E.right(wrapInteger(bigInt(amount)))
  }
  return E.left(new Error('could not parse as Integer'))
}

export function $parseIntegerUnsafe(amount: Numeric): Integer {
  if (bigInt.isInstance(amount)) {
    return wrapInteger(amount)
  }
  if (BigNumber.isBigNumber(amount) && (amount as BigNumber).isInteger()) {
    return wrapInteger(bigInt(amount.toString()))
  }
  if (typeof amount === 'string' && new BigNumber(amount).isInteger()) {
    return wrapInteger(bigInt(amount))
  }
  throw new Error('could not parse as Integer')
}

export function $parseNaturalUnsafe(amount: Numeric): Natural {
  const amountNatural = fn.pipe(
    fromInteger($parseIntegerUnsafe(amount)),
    O.fold(
      () => undefined,
      (a) => a,
    ),
  )
  if (!amountNatural) throw new Error('could not parse as Natural')
  return amountNatural
}

// string conversions

export function $naturalToString(n: Natural): string {
  return showNatural(n)
}
