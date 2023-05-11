enum ProductType {
  Borrow = 'borrow',
  Multiply = 'multiply',
  Earn = 'earn',
}

export interface OasisCreateItem {
  product: ProductType
  collateralToken: 'string'
  debtToken: 'string'
}
