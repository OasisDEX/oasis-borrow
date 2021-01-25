import bigInt from 'big-integer'
import { BigNumber } from 'bignumber.js'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as Int from 'money-ts/lib/Integer'
import * as Nat from 'money-ts/lib/Natural'
import * as Rat from 'money-ts/lib/Rational'
import * as NzInt from 'money-ts/lib/NonZeroInteger'
import * as fn from 'fp-ts/function'
import * as Ord from 'fp-ts/lib/Ord'
import * as Eq from 'fp-ts/lib/Eq'

export type Numeric = bigInt.BigInteger | string | BigNumber | Int.Integer

function $parseInteger(amount: Numeric): E.Either<Error, Int.Integer> {
  if (bigInt.isInstance(amount)) {
    // Int.Integer already is instance so falls through
    return E.right(Int.wrap(amount))
  }
  if (BigNumber.isBigNumber(amount) && (amount as BigNumber).isInteger()) {
    return E.right(Int.wrap(bigInt(amount.toString())))
  }
  if (typeof amount === 'string' && new BigNumber(amount).isInteger()) {
    return E.right(Int.wrap(bigInt(amount)))
  }
  return E.left(new Error('could not parse as Integer'))
}

function $parseIntegerUnsafe(amount: Numeric): Int.Integer {
  if (bigInt.isInstance(amount)) {
    // Int.Integer already is instance so falls through
    return Int.wrap(amount)
  }
  if (BigNumber.isBigNumber(amount) && (amount as BigNumber).isInteger()) {
    return Int.wrap(bigInt(amount.toString()))
  }
  if (typeof amount === 'string' && new BigNumber(amount).isInteger()) {
    return Int.wrap(bigInt(amount))
  }
  throw new Error('could not parse as Integer')
}

function $parseNaturalUnsafe(amount: Numeric): Nat.Natural {
  const amountNatural = fn.pipe(
    Nat.fromInteger($parseIntegerUnsafe(amount)),
    O.fold(
      () => undefined,
      (a) => a,
    ),
  )
  if (!amountNatural) throw new Error('could not parse as Natural')
  return amountNatural
}

function $parseNonZeroIntegerUnsafe(amount: Numeric): NzInt.NonZeroInteger {
  const amountNonZeroInt = fn.pipe(
    NzInt.fromInteger($parseIntegerUnsafe(amount)),
    O.fold(
      () => undefined,
      (a) => a,
    ),
  )
  if (!amountNonZeroInt) throw new Error('could not parse as a NonZeroInteger')
  return amountNonZeroInt
}

function $parseRationalUnsafe(n: Numeric, d: Numeric): Rat.Rational {
  return [$parseIntegerUnsafe(n), $parseNaturalUnsafe(d)]
}

function $NatEq(x: Nat.Natural, y: Nat.Natural) {
  if (Ord.lt(Nat.ord)(x, y) || Ord.gt(Nat.ord)(x, y)) {
    return false
  }
  return true
}

// function expBySquaring(x: Int.Integer, n: Nat.Natural): Int.Integer {
//   if ($NatEq(n, Nat.one)) {
//     return x
//   }
//   else if() {

//   }
// }

export function $naturalToString(n: Nat.Natural): string {
  return Nat.show(n)
}

export function $pow(r: Nat.Natural): Nat.Natural {
  return Nat.one
}

export const $Int = $parseIntegerUnsafe
export const $Nat = $parseNaturalUnsafe
export const $NzInt = $parseNonZeroIntegerUnsafe
export const $Rat = $parseRationalUnsafe
