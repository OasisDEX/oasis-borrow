import { combineLatest, Observable, of } from 'rxjs'
import { map as mapL, reduce } from 'lodash'
import { filter, map } from 'rxjs/operators'

export type AssetAction = {
  url: string
  text: string
  icon: string
}

type ProductCategory = 'multiply' | 'borrow' | 'earn'

type ProductCategoryIlks = {
  [category in ProductCategory]: Array<string> // Array<ilks>
}

function productCategoryToAssetAction(productCategory: ProductCategory): AssetAction {
  switch (productCategory) {
    case 'borrow':
      return {
        url: '/borrow',
        text: 'Borrow',
        icon: 'collateral',
      }
    case 'multiply':
      return {
        url: '/multiply',
        text: 'Multiply',
        icon: 'copy',
      }
    case 'earn':
      throw 'not yet'
    default:
      throw `no asset action for productCategory ${productCategory}`
  }
}

// returns a list of actions a user can perform for a given asset
export function createAssetActions$(
  ilkToToken$: (ilk: string) => Observable<string>,
  productCategoryIlks: ProductCategoryIlks,
  token: string,
): Observable<Array<AssetAction>> {
  const ilkToProductCategory = reduce<
    ProductCategoryIlks,
    {
      [ilk: string]: Array<ProductCategory>
    }
  >(
    productCategoryIlks,
    (acc, ilksInProduct, productCategory) => {
      ilksInProduct.forEach((ilk) => {
        if (!acc[ilk]) {
          acc[ilk] = [productCategory as ProductCategory] // Object entries/reduce etc map to `string` for keys
        } else {
          acc[ilk].push(productCategory as ProductCategory) // Object entries/reduce etc map to `string` for keys
        }
      })
      return acc
    },
    {},
  )

  const tokenToProductCategories$ = combineLatest(
    mapL(ilkToProductCategory, (productCategories, ilk) => {
      return combineLatest(ilkToToken$(ilk), of(productCategories))
    }),
  ).pipe(
    map((tokenToProductCategories) => {
      const relevantMappings = tokenToProductCategories.filter(([t]) => t === token)
      return relevantMappings
        .reduce<Array<ProductCategory>>((acc, [_token, productCategories]) => {
          return [...new Set([...acc, ...productCategories])] // dedupe
        }, [])
        .map(productCategoryToAssetAction)
    }),
  )

  return tokenToProductCategories$
}
