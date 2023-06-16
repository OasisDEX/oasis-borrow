import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { PromoCardProps, PromoCardVariant } from 'components/PromoCard'
import { isShortPosition } from 'features/ajna/positions/common/helpers/isShortPosition'
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
  maxLtv?: string,
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
      {
        label: {
          key: 'ajna.promo-cards.max-ltv',
          props: {
            maxLtv: maxLtv ? formatDecimalAsPercent(new BigNumber(maxLtv)) : 'n/a',
          },
        },
      },
      getAjnaTokensPill,
    ],
  }
}

export function parseAjnaMultiplyPromoCard(
  collateralToken: string,
  quoteToken: string,
  maxMultiply?: string,
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
      {
        label: {
          key: 'ajna.promo-cards.up-to-multiple',
          props: {
            maxMultiple: maxMultiply ? `${parseFloat(maxMultiply).toFixed(2)}x` : 'n/a',
          },
        },
      },
      getAjnaTokensPill,
    ],
  }
}

export function parseAjnaEarnPromoCard(
  collateralToken: string,
  quoteToken: string,
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
          key: 'ajna.promo-cards.lends-to-one-token',
        },
      },
      getAjnaTokensPill,
    ],
  }
}
