import { Discrete } from 'money-ts/lib/Discrete'
import { Integer } from 'money-ts/lib/Integer'
import { Natural } from 'money-ts/lib/Natural'

type Numerator = Integer
type Denominator = Natural

export class Fraction extends Ratio<Integer, Natural> {
  constructor(numerator: Numerator, denominator: Denominator) {
    super(numerator, denominator)
  }

  get numerator(): Numerator {
    return this._antecedent
  }

  get denominator(): Denominator {
    return this._consequent
  }
}
