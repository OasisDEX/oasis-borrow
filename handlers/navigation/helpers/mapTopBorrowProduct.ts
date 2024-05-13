import BigNumber from 'bignumber.js'
import { networksByName } from 'blockchain/networks'
import type { NavigationMenuPanelListItem } from 'components/navigation/Navigation.types'
import { OmniProductType } from 'features/omni-kit/types'
import { getGenericPositionUrl } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { capitalize } from 'lodash'
import { i18n } from 'next-i18next'

export function mapTopBorrowProduct(rows: ProductHubItem[]): NavigationMenuPanelListItem[] {
  if (!i18n?.t) {
    throw new Error('Failed to load translation')
  }

  const borrowRows = rows
    .filter(({ product }) => product.includes(OmniProductType.Borrow))
    .filter(({ liquidity }) => new BigNumber(liquidity ?? 0).gt(zero))

  const topLtv = borrowRows.sort((a, b) =>
    new BigNumber(b.maxLtv ?? 0).minus(new BigNumber(a.maxLtv ?? 0)).toNumber(),
  )[0]
  const topFee = borrowRows
    .filter(({ fee }) => new BigNumber(fee ?? 0).gt(zero))
    .sort((a, b) => new BigNumber(a.fee ?? 0).minus(new BigNumber(b.fee ?? 0)).toNumber())[0]
  const topRewards = borrowRows
    .filter(({ hasRewards }) => hasRewards)
    .sort((a, b) =>
      new BigNumber(b.liquidity ?? 0).minus(new BigNumber(a.liquidity ?? 0)).toNumber(),
    )[0]

  return [
    {
      title: i18n.t('nav.borrow-up-to-ltv', {
        maxLtv: formatDecimalAsPercent(new BigNumber(topLtv.maxLtv ?? 0)),
      }),
      description: i18n.t('nav.discover-the-highest-ltv'),
      icon: {
        tokens: [topLtv.primaryToken, topLtv.secondaryToken],
        position: 'global',
      },
      tags: [
        [
          lendingProtocolsByName[topLtv.protocol].label,
          lendingProtocolsByName[topLtv.protocol].gradient,
        ],
        [capitalize(topLtv.network), networksByName[topLtv.network].gradient],
      ],
      url: getGenericPositionUrl({
        ...topLtv,
        product: [OmniProductType.Borrow],
      }),
    },
    {
      title: i18n.t('nav.borrow-lowest-fee', {
        token: topFee.primaryToken,
        fee: formatDecimalAsPercent(new BigNumber(topFee.fee ?? 0)),
      }),
      description: i18n.t('nav.find-the-lowest-rates'),
      icon: {
        position: 'global',
        tokens: [topFee.primaryToken, topFee.secondaryToken],
      },
      tags: [
        [
          lendingProtocolsByName[topFee.protocol].label,
          lendingProtocolsByName[topFee.protocol].gradient,
        ],
        [capitalize(topFee.network), networksByName[topFee.network].gradient],
      ],
      url: getGenericPositionUrl({
        ...topFee,
        product: [OmniProductType.Borrow],
      }),
    },
    {
      title: i18n.t('nav.earn-rewards-while-borrowing'),
      description: i18n.t('nav.get-paid-to-borrow'),
      icon: {
        position: 'global',
        tokens: [topRewards.primaryToken, topRewards.secondaryToken],
      },
      tags: [
        [
          lendingProtocolsByName[topRewards.protocol].label,
          lendingProtocolsByName[topRewards.protocol].gradient,
        ],
        [capitalize(topRewards.network), networksByName[topRewards.network].gradient],
      ],
      url: getGenericPositionUrl({
        ...topRewards,
        product: [OmniProductType.Borrow],
      }),
    },
  ]
}
