import BigNumber from 'bignumber.js'
import type { PromoCardProps } from 'components/PromoCard.types'
import { getActionUrl } from 'features/productHub/helpers'
import type {
  ProductHubItem,
  ProductHubManagementType,
  ProductHubMultiplyStrategyType,
} from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { shuffle, upperFirst } from 'lodash'

interface GetGenericPromoCardParams {
  product: ProductHubItem
}

interface GetGenericPromoCardTitleParams {
  depositToken?: string
  earnStrategyDescription?: string
  primaryToken: string
  secondaryToken: string
  type: ProductHubProductType
}

interface GetGenericPromoCardPillsParams {
  fee?: string
  managementType?: ProductHubManagementType
  maxLtv?: string
  maxMultiply?: string
  multiplyStrategyType?: ProductHubMultiplyStrategyType
  primaryToken: string
  secondaryToken: string
  type: ProductHubProductType
  weeklyNetApy?: string
}

export function getGenericPromoCardTitle({
  depositToken,
  earnStrategyDescription,
  primaryToken,
  secondaryToken,
  type,
}: GetGenericPromoCardTitleParams): string {
  switch (type) {
    case ProductHubProductType.Borrow:
      return `Borrow ${secondaryToken} against ${primaryToken}`
    case ProductHubProductType.Earn:
      return earnStrategyDescription ?? `Earn on your ${depositToken ?? primaryToken}`
    case ProductHubProductType.Multiply:
      return `Multiply exposure to ${primaryToken} against ${secondaryToken}`
  }
}

export function getGenericPromoCardPills({
  fee,
  managementType,
  maxLtv,
  maxMultiply,
  multiplyStrategyType,
  primaryToken,
  secondaryToken,
  type,
  weeklyNetApy,
}: GetGenericPromoCardPillsParams): PromoCardProps['pills'] {
  switch (type) {
    case ProductHubProductType.Borrow:
      return [
        ...(maxLtv
          ? [{ label: `Up to ${formatDecimalAsPercent(new BigNumber(maxLtv))} LTV` }]
          : []),
        ...(fee
          ? [{ label: `Only ${formatDecimalAsPercent(new BigNumber(fee))} borrow rate` }]
          : []),
      ]
    case ProductHubProductType.Earn:
      return [
        ...(weeklyNetApy
          ? [{ label: `${formatDecimalAsPercent(new BigNumber(weeklyNetApy))} avg weekly APY` }]
          : []),
        ...(managementType ? [{ label: `${upperFirst(managementType)} management` }] : []),
      ]
    case ProductHubProductType.Multiply:
      return [
        ...(maxMultiply
          ? [{ label: `Up to ${new BigNumber(maxMultiply).toFixed(2)}x multiple` }]
          : []),
        ...(multiplyStrategyType === 'short'
          ? [{ label: `${upperFirst(multiplyStrategyType)} ${secondaryToken}` }]
          : []),
        ...(multiplyStrategyType === 'long'
          ? [{ label: `${upperFirst(multiplyStrategyType)} ${primaryToken}` }]
          : []),
      ]
  }
}

export function getGenericPromoCard({ product }: GetGenericPromoCardParams): PromoCardProps {
  const {
    depositToken,
    earnStrategyDescription,
    fee,
    managementType,
    maxLtv,
    maxMultiply,
    multiplyStrategyType,
    network,
    primaryToken,
    product: productType,
    protocol,
    secondaryToken,
    weeklyNetApy,
  } = product
  const [type] = shuffle(productType)

  return {
    tokens: [primaryToken, ...(primaryToken !== secondaryToken ? [secondaryToken] : [])],
    title: getGenericPromoCardTitle({
      depositToken,
      earnStrategyDescription,
      primaryToken,
      secondaryToken,
      type,
    }),
    protocol: { network, protocol },
    pills: getGenericPromoCardPills({
      fee,
      managementType,
      maxLtv,
      maxMultiply,
      multiplyStrategyType,
      primaryToken,
      secondaryToken,
      type,
      weeklyNetApy,
    }),
    link: {
      href: getActionUrl({
        ...product,
        product: [type],
      }),
    },
  }
}
