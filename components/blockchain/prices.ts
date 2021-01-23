export class GenericPrice<Base extends Token<IsoCode>, Quote extends Token<IsoCode>> extends Ratio<
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

type Price<B extends IsoCode, Q extends IsoCode> = GenericPrice<Token<B>, Token<Q>>
