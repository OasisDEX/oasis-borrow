import BigNumber from 'bignumber.js'
import type { PromoCardProps } from 'components/PromoCard.types'
import { ProductHubProductType } from 'features/productHub/types'
import { getPromoCardsCommonPayload } from 'handlers/product-hub/promo-cards/parsers'
import type { ParsePromoCardParams } from 'handlers/product-hub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

export function parseEarnYieldLoopPromoCard(params: ParsePromoCardParams): PromoCardProps {
  const { collateralToken, debtToken, product } = params

  return {
    ...getPromoCardsCommonPayload({ ...params, productType: ProductHubProductType.Earn }),
    title: {
      key: 'product-hub.promo-cards.yield-loop-strategy',
      props: {
        collateralToken,
        quoteToken: debtToken,
      },
    },
    ...(product?.weeklyNetApy && {
      data: [
        {
          label: { key: 'product-hub.promo-cards.7-day-avg-apy' },
          value: formatDecimalAsPercent(new BigNumber(product.weeklyNetApy)),
        },
      ],
    }),
  }
}
