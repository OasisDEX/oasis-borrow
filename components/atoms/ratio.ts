export class Ratio<A, B> {
  readonly _antecedent: A
  readonly _consequent: B

  constructor(antecedent: A, consequent: B) {
    this._antecedent = antecedent
    this._consequent = consequent
  }
}
