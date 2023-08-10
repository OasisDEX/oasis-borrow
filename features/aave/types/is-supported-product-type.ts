export type ProductType = 'Multiply' | 'Earn' | 'Borrow'

export function isSupportedProductType(value: string): value is ProductType {
  return ['Multiply'.toLowerCase(), 'Earn'.toLowerCase(), 'Borrow'.toLowerCase()].includes(
    value.toLowerCase(),
  )
}
