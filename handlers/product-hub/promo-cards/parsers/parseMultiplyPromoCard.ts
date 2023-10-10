import BigNumber from 'bignumber.js'
import type { PromoCardProps } from 'components/PromoCard.types'
import { ProductHubProductType } from 'features/productHub/types'
import { getPromoCardsCommonPayload } from 'handlers/product-hub/promo-cards/parsers'
import type { ParsePromoCardParams } from 'handlers/product-hub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

export function parseMultiplyPromoCard(params: ParsePromoCardParams): PromoCardProps {
  const { collateralToken, debtToken, product } = params

  return {
    ...getPromoCardsCommonPayload({ ...params, productType: ProductHubProductType.Multiply }),
    title: {
      key:
        product && product.maxMultiply
          ? 'product-hub.promo-cards.up-to-exposure-against'
          : 'product-hub.promo-cards.exposure-against',
      props: {
        collateralToken,
        debtToken,
        ...(product &&
          product.maxMultiply && {
            maxMultiple: `${new BigNumber(product.maxMultiply).toFixed(1)}x`,
          }),
      },
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
