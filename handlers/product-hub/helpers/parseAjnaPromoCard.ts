import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { PromoCardProps, PromoCardVariant } from 'components/PromoCard'
import { isShortPosition } from 'features/ajna/positions/common/helpers/isShortPosition'
import { getActionUrl } from 'features/productHub/helpers'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

const protocol = { network: NetworkNames.ethereumMainnet, protocol: LendingProtocol.Ajna }
const getAjnaTokensPill = {
  label: { key: 'ajna.promo-cards.get-ajna-tokens' },
  variant: 'positive' as PromoCardVariant,
}

export function parseAjnaBorrowPromoCard(
  collateralToken: string,
  quoteToken: string,
  product?: ProductHubItem,
): PromoCardProps {
  return {
    tokens: [collateralToken, quoteToken],
    title: `${collateralToken}/${quoteToken}`,
    description: {
      key: 'ajna.promo-cards.borrow-and-earn-ajna',
      props: { collateralToken, quoteToken },
    },
    protocol,
    pills: [
      ...(product?.maxLtv
        ? [
            {
              label: {
                key: 'ajna.promo-cards.max-ltv',
                props: {
                  maxLtv: formatDecimalAsPercent(new BigNumber(product.maxLtv)),
                },
              },
            },
          ]
        : []),
      getAjnaTokensPill,
    ],
    ...(product && {
      link: {
        href: getActionUrl({ ...product, product: [ProductHubProductType.Borrow] }),
      },
    }),
  }
}

export function parseAjnaMultiplyPromoCard(
  collateralToken: string,
  quoteToken: string,
  product?: ProductHubItem,
): PromoCardProps {
  const isShort = isShortPosition({ collateralToken })

  return {
    tokens: [collateralToken, quoteToken],
    title: `${collateralToken}/${quoteToken}`,
    description: {
      key: 'ajna.promo-cards.multiply-and-earn-ajna',
      props: {
        token: isShort ? quoteToken : collateralToken,
        strategy: isShort ? 'Short' : 'Long',
      },
    },
    protocol,
    pills: [
      ...(product?.maxMultiply
        ? [
            {
              label: {
                key: 'ajna.promo-cards.up-to-multiple',
                props: {
                  maxMultiple: `${parseFloat(product.maxMultiply).toFixed(2)}x`,
                },
              },
            },
          ]
        : []),
      getAjnaTokensPill,
    ],
    ...(product && {
      link: {
        href: getActionUrl({ ...product, product: [ProductHubProductType.Multiply] }),
      },
    }),
  }
}

export function parseAjnaEarnPromoCard(
  collateralToken: string,
  quoteToken: string,
  product?: ProductHubItem,
): PromoCardProps {
  return {
    tokens: [collateralToken, quoteToken],
    title: `${collateralToken}/${quoteToken}`,
    description: {
      key: 'ajna.promo-cards.lend-against-collateral',
      props: { collateralToken, quoteToken },
    },
    protocol,
    pills: [
      {
        label: {
          key: product?.weeklyNetApy
            ? 'ajna.promo-cards.get-weekly-apy'
            : 'ajna.promo-cards.lends-to-one-token',
          props: {
            ...(product?.weeklyNetApy && {
              weeklyNetApy: formatDecimalAsPercent(new BigNumber(product.weeklyNetApy)),
            }),
          },
        },
      },
      getAjnaTokensPill,
    ],
    ...(product && {
      link: {
        href: getActionUrl({ ...product, product: [ProductHubProductType.Earn] }),
      },
    }),
  }
}
