import { Currency } from './currency'
import { Ratio } from './ratio'

// EUR/USD = 1.55 = 1 EUR : 1.55 USD
export class Price<Base extends Currency<any, any>, Quote extends Currency<any, any>> extends Ratio<
  Base,
  Quote
> {
  constructor(base: Base, quote: Quote) {
    super(base, quote)
  }

  get base(): Base {
    return this._antecedent
  }

  get quote(): Quote {
    return this._consequent
  }
}
