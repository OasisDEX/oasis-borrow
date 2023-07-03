import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { PromoCardProps, PromoCardVariant } from 'components/PromoCard'
import { getActionUrl } from 'features/productHub/helpers'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

interface parseMultiplyPromoCardParams {
  collateralToken: string
  debtToken: string
  network?: NetworkNames
  pills?: PromoCardProps['pills']
  product?: ProductHubItem
  protocol: LendingProtocol
  withLtvPill?: boolean
}

export function getAjnaTokensPill() {
  return {
    label: { key: 'product-hub.promo-cards.get-ajna-tokens' },
    variant: 'positive' as PromoCardVariant,
  }
}
export function getAutomationEnabledPill() {
  return {
    label: { key: 'product-hub.promo-cards.automation-enabled' },
    variant: 'positive' as PromoCardVariant,
  }
}
export function getEarnStakingRewardsPill() {
  return {
    label: { key: 'product-hub.promo-cards.earn-staking-rewards' },
  }
}
export function getEnterWithToken(token: string) {
  return {
    label: { key: 'product-hub.promo-cards.enter-with-token', props: { token } },
  }
}
export function getHighestAvailableLtvPill() {
  return {
    label: { key: 'product-hub.promo-cards.highest-available-ltv' },
  }
}
export function getHighestMultiplePill() {
  return {
    label: { key: 'product-hub.promo-cards.highest-multiple' },
  }
}
export function getLongTokenPill(token: string) {
  return {
    label: { key: 'product-hub.promo-cards.long-token', props: { token } },
  }
}
export function getLowestBorrowingCostPill() {
  return {
    label: { key: 'product-hub.promo-cards.lowest-borrowing-cost' },
  }
}
export function getMaxLtvPill(maxLtv: string) {
  return {
    label: { key: 'product-hub.promo-cards.max-ltv', props: { maxLtv } },
  }
}
export function getUpToYieldExposurePill(maxMultiple: string) {
  return {
    label: { key: 'product-hub.promo-cards.up-to-yield-exposure', props: { maxMultiple } },
  }
}

function getCommonPayload({
  collateralToken,
  debtToken,
  network = NetworkNames.ethereumMainnet,
  pills,
  product,
  productType,
  protocol,
  withLtvPill,
}: parseMultiplyPromoCardParams & { productType: ProductHubProductType }) {
  return {
    tokens: [collateralToken.toUpperCase(), debtToken.toUpperCase()],
    protocol: {
      network,
      protocol,
    },
    pills: [
      ...(withLtvPill && product?.maxLtv
        ? [
            {
              label: {
                key: 'product-hub.promo-cards.max-ltv',
                props: {
                  maxLtv: formatDecimalAsPercent(new BigNumber(product.maxLtv)),
                },
              },
            },
          ]
        : []),
      ...(pills || []),
    ],
    ...(product && {
      link: {
        href: getActionUrl({
          bypassFeatureFlag: true,
          ...product,
          product: [productType],
        }),
      },
    }),
  }
}

export function parseBorrowPromoCard(params: parseMultiplyPromoCardParams): PromoCardProps {
  const { collateralToken, debtToken, product } = params

  return {
    ...getCommonPayload({
      ...params,
      productType: ProductHubProductType.Multiply,
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

export function parseMultiplyPromoCard(params: parseMultiplyPromoCardParams): PromoCardProps {
  const { collateralToken, debtToken, product } = params

  return {
    ...getCommonPayload({ ...params, productType: ProductHubProductType.Multiply }),
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

export function parseEarnYieldLoopPromoCard(params: parseMultiplyPromoCardParams): PromoCardProps {
  const { collateralToken, debtToken, product } = params

  return {
    ...getCommonPayload({ ...params, productType: ProductHubProductType.Earn }),
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
