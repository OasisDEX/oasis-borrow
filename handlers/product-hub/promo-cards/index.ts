import { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import ajnaLpHandler from 'handlers/product-hub/promo-cards/ajnaLpHandler'
import home from 'handlers/product-hub/promo-cards/home'
import { PromoCardsCollection } from 'handlers/product-hub/types'

export const PROMO_CARD_COLLECTIONS_PARSERS: {
  [key in PromoCardsCollection]: (table: ProductHubItem[]) => ProductHubPromoCards
} = {
  AjnaLP: ajnaLpHandler,
  Home: home,
  // TODO: replace with proper hander when available
  HomeWithAjna: home,
}
