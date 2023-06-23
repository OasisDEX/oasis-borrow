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

export function parseMultiplyPromoCard({
  collateralToken,
  debtToken,
  network = NetworkNames.ethereumMainnet,
  pills,
  product,
  protocol,
}: parseMultiplyPromoCardParams): PromoCardProps {
  return {
    tokens: [collateralToken, debtToken],
    title: {
      key:
        product && product.maxMultiply
          ? 'product-hub.promo-cards.up-to-exposure-against'
          : 'product-hub.promo-cards.exposure-against',
      props: {
        ...(product &&
          product.maxMultiply && {
            collateralToken,
            debtToken,
            maxMultiple: `${new BigNumber(product.maxMultiply).toFixed(1)}x`,
          }),
      },
    },
    protocol: {
      network,
      protocol,
    },
    ...(product && {
      link: {
        href: getActionUrl({
          bypassFeatureFlag: true,
          ...product,
          product: [ProductHubProductType.Multiply],
        }),
      },
    }),
    pills,
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
