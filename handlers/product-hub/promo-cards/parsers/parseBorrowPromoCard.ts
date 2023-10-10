import BigNumber from 'bignumber.js'
import type { PromoCardProps } from 'components/PromoCard.types'
import { ProductHubProductType } from 'features/productHub/types'
import { getPromoCardsCommonPayload } from 'handlers/product-hub/promo-cards/parsers'
import type { ParsePromoCardParams } from 'handlers/product-hub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

export function parseBorrowPromoCard(params: ParsePromoCardParams): PromoCardProps {
  const { collateralToken, debtToken, product } = params

  return {
    ...getPromoCardsCommonPayload({
      ...params,
      productType: ProductHubProductType.Borrow,
    }),
    title: {
      key: 'product-hub.promo-cards.borrow-against',
      props: { collateralToken, debtToken },
    },
    ...(product?.fee && {
      data: [
        {
          label: { key: 'product-hub.promo-cards.borrow-rate' },
          value: formatDecimalAsPercent(new BigNumber(product.fee)),
        },
      ],
    }),
  }
}
