import { EarnStrategies } from '@prisma/client'
import type { ProductHubItem } from 'features/productHub/types'
import { findByTokenPair } from 'handlers/product-hub/helpers'
import { parseSteakhousePromoCard } from 'handlers/product-hub/promo-cards/parsers'

export function getSteakhousePromoCards(table: ProductHubItem[]) {
  const erc4626Products = table.filter(
    ({ earnStrategy }) => earnStrategy === EarnStrategies.erc_4626,
  )
  const erc4626SteakhouseProducts = erc4626Products.filter(({ label }) =>
    label.toLowerCase().includes('steakhouse'),
  )

  const USDCErc4626SteakhouseProduct = findByTokenPair(erc4626SteakhouseProducts, ['USDC', 'USDC'])

  const promoUSDCErc4626Steakhouse = parseSteakhousePromoCard({
    token: 'USDC',
    product: USDCErc4626SteakhouseProduct,
  })

  return {
    promoUSDCErc4626Steakhouse,
  }
}
