import type { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import ajnaLp from 'handlers/product-hub/promo-cards/ajnaLp'
import home from 'handlers/product-hub/promo-cards/home'
import homeWithAjna from 'handlers/product-hub/promo-cards/homeWithAjna'
import type { PromoCardsCollection } from 'handlers/product-hub/types'

export const PROMO_CARD_COLLECTIONS_PARSERS: {
  [key in PromoCardsCollection]: (table: ProductHubItem[]) => ProductHubPromoCards
} = {
  AjnaLP: ajnaLp,
  Home: home,
  HomeWithAjna: homeWithAjna,
}
