import { ProductType } from './is-supported-product-type'

export function getSurveyType(value: ProductType): 'earn' | 'multiply' | 'borrow' {
  switch (value) {
    case ProductType.Earn:
      return 'earn'
    case ProductType.Multiply:
      return 'multiply'
    case ProductType.Borrow:
      return 'borrow'
  }
}
