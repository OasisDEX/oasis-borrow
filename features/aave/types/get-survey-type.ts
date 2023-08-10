import { ProductType } from './is-supported-product-type'

export function getSurveyType(value: ProductType): 'earn' | 'multiply' | 'borrow' {
  switch (value) {
    case 'Earn':
      return 'earn'
    case 'Multiply':
      return 'multiply'
    case 'Borrow':
      return 'borrow'
  }
}
