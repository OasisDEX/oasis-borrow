export type ProductCategory = 'multiply' | 'borrow' | 'earn'

export function getProductCategoryUrl(productCategory: ProductCategory): string {
  switch (productCategory) {
    case 'multiply':
      return '/multiply'
    case 'borrow':
      return '/borrow'
    case 'earn':
      return '/earn'
  }
}
