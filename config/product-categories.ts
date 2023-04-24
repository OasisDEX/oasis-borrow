import { INTERNAL_LINKS } from 'helpers/applicationLinks'

export type ProductCategory = 'multiply' | 'borrow' | 'earn'

export function getProductCategoryUrl(productCategory: ProductCategory): string {
  switch (productCategory) {
    case 'multiply':
      return INTERNAL_LINKS.multiply
    case 'borrow':
      return INTERNAL_LINKS.borrow
    case 'earn':
      return INTERNAL_LINKS.earn
  }
}
