import { Price } from './price'
import { Ratio } from './ratio'

export class PriceRatio<
  AntedecentPrice extends Price<any, any>,
  ConsequentPrice extends Price<any, any>
> extends Ratio<AntedecentPrice, ConsequentPrice> {
  constructor(antecedentPrice: AntedecentPrice, consequentPrice: ConsequentPrice) {
    super(antecedentPrice, consequentPrice)
  }

  get antecedentPrice(): AntedecentPrice {
    return this._antecedent
  }

  get consequentPrice(): ConsequentPrice {
    return this._consequent
  }

  get percentage(): string {
    return '100 %'
  }
}
