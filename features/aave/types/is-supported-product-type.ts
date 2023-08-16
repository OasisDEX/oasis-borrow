export enum ProductType {
  'Multiply' = 'Multiply',
  'Earn' = 'Earn',
  'Borrow' = 'Borrow'
}

export function isSupportedProductType(value: string): value is ProductType {
  return ['Multiply'.toLowerCase(), 'Earn'.toLowerCase(), 'Borrow'.toLowerCase()].includes(
    value.toLowerCase(),
  )
}
