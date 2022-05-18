import { map as mapL, reduce } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { UIChanges } from '../../../components/AppContext'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
} from '../../automation/protection/common/UITypes/SwapWidgetChange'

export type AssetAction = UrlAssetAction | OnClickAssetAction

type UrlAssetAction = {
  url: string
  text: string
  icon: string
}

type OnClickAssetAction = {
  onClick: () => void
  text: string
  icon: string
}

export function isUrlAction(aa: AssetAction): aa is UrlAssetAction {
  return (aa as UrlAssetAction).url !== undefined
}

export function isOnClickAction(aa: AssetAction): aa is OnClickAssetAction {
  return (aa as OnClickAssetAction).onClick !== undefined
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
      throw new Error('not yet')
    default:
      throw new Error(`no asset action for productCategory ${productCategory}`)
  }
}

// returns a list of actions a user can perform for a given asset
export function createAssetActions$(
  ilkToToken$: (ilk: string) => Observable<string>,
  productCategoryIlks: ProductCategoryIlks,
  uiChanges: UIChanges,
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

  const assetActions$ = combineLatest(
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
    // add swap
    map((assetActions) => {
      return [
        {
          onClick: () => {
            uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
              type: 'open',
              token,
            })
          },
          text: 'Swap',
          icon: 'exchange',
        },
        ...assetActions,
      ]
    }),
  )

  return assetActions$
}
