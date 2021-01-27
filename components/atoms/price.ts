import { Currency } from './currency'
import * as XR from 'money-ts/lib/ExchangeRate'
import * as fp from 'fp-ts/function'
import * as Nat from 'money-ts/lib/Natural'
import * as Int from 'money-ts/lib/Integer'
import * as PosRat from 'money-ts/lib/PositiveRational'
import { Discrete } from 'money-ts/lib/Discrete'
import { Dense, fromDiscrete } from 'money-ts/lib/Dense'

import * as O from 'fp-ts/lib/Option'

export class Price<Base extends Currency<any, any>, Quote extends Currency<any, any>> {
  readonly _base: Base
  readonly _quote: Quote

  readonly _baseInt: Int.Integer
  readonly _quoteInt: Int.Integer

  readonly _baseNat: Nat.Natural
  readonly _quoteNat: Nat.Natural

  constructor(base: Base, quote: Quote) {
    this._base = base
    this._quote = quote

    this._baseInt = this._base.discrete.value
    this._quoteInt = this._quote.discrete.value

    if (Int.isZero(this._baseInt) || Int.isZero(this._quoteInt)) throw new Error('Must be non-zero')

    this._baseNat = fp.pipe(
      Nat.fromInteger(this._baseInt),
      O.fold(
        () => {
          return Nat.wrap(Int.unwrap(Int.negate(this._baseInt))).getOrElse(Nat.one)
        },
        (x) => x,
      ),
    )

    this._quoteNat = fp.pipe(
      Nat.fromInteger(this._quoteInt),
      O.fold(
        () => {
          return Nat.wrap(Int.unwrap(Int.negate(this._quoteInt))).getOrElse(Nat.one)
        },
        (x) => x,
      ),
    )
  }

  get base(): Base {
    return this._base
  }

  get quote(): Quote {
    return this._quote
  }

  toString(): string {
    return 'sd'
  }

  /**
   * exchange takes an amount of type
   *
   * exchange(10 EUR 1.2 EUR/USD) = 12 USD
   */
  exchange(amount: Base): Quote {
    return this.quote
  }
}
