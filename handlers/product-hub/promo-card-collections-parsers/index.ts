import { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import ajnaLpHandler from 'handlers/product-hub/promo-card-collections-parsers/ajnaLpHandler'
import { PromoCardsCollection } from 'handlers/product-hub/types'
import { productHubData as mockData } from 'helpers/mocks/productHubData.mock'

export const PROMO_CARD_COLLECTIONS_PARSERS: {
  [key in PromoCardsCollection]: (table: ProductHubItem[]) => ProductHubPromoCards
} = {
  AjnaLP: ajnaLpHandler,
  Home: () => mockData.promoCards,
}
