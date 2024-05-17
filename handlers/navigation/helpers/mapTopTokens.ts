import BigNumber from 'bignumber.js'
import type { NavigationMenuPanelListItem } from 'components/navigation/Navigation.types'
import type { ProductHubItem } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { i18n } from 'next-i18next'

export function mapTopTokens(token: string, rows: ProductHubItem[]): NavigationMenuPanelListItem[] {
  if (!i18n?.t) {
    throw new Error('Failed to load translation')
  }

  const tokenRows = rows.filter(
    ({ primaryToken }) => primaryToken.toUpperCase() === token.toUpperCase(),
  )

  const topFee = tokenRows
    .filter(({ fee }) => new BigNumber(fee ?? 0).gt(zero))
    .sort((a, b) => new BigNumber(a.fee ?? 0).minus(new BigNumber(b.fee ?? 0)).toNumber())[0]
  const topMultiple = tokenRows
    .filter(({ maxMultiply }) => new BigNumber(maxMultiply ?? 0).gt(zero))
    .sort((a, b) =>
      new BigNumber(b.maxMultiply ?? 0).minus(new BigNumber(a.maxMultiply ?? 0)).toNumber(),
    )[0]
  const topApyActive = tokenRows
    .filter(
      ({ managementType, weeklyNetApy }) =>
        managementType === 'active' && new BigNumber(weeklyNetApy ?? 0).gt(zero),
    )
    .sort((a, b) =>
      new BigNumber(b.weeklyNetApy ?? 0).minus(new BigNumber(a.weeklyNetApy ?? 0)).toNumber(),
    )[0]
  const topApyPassive = tokenRows
    .filter(
      ({ managementType, weeklyNetApy }) =>
        managementType === 'passive' && new BigNumber(weeklyNetApy ?? 0).gt(zero),
    )
    .sort((a, b) =>
      new BigNumber(b.weeklyNetApy ?? 0).minus(new BigNumber(a.weeklyNetApy ?? 0)).toNumber(),
    )[0]

  return [
    ...(topApyActive || topApyPassive
      ? [
          {
            title: i18n.t('nav.earn'),
            url: `${INTERNAL_LINKS.earn}?deposit-token=${token}`,
            description: i18n.t(
              topApyActive && topApyPassive
                ? 'nav.tokens-earn'
                : topApyActive
                  ? 'nav.tokens-earn-active'
                  : 'nav.tokens-earn-passive',
              {
                token,
                apyActive: formatDecimalAsPercent(new BigNumber(topApyActive?.weeklyNetApy ?? 0)),
                apyPassive: formatDecimalAsPercent(new BigNumber(topApyPassive?.weeklyNetApy ?? 0)),
              },
            ),
          },
        ]
      : []),
    ...(topMultiple
      ? [
          {
            title: i18n.t('nav.multiply'),
            description: i18n.t('nav.tokens-multiply', {
              token,
              maxMultiple: new BigNumber(topMultiple.maxMultiply ?? 0).toFixed(2),
            }),
            url: `${INTERNAL_LINKS.multiply}?collateral-token=${token}`,
          },
        ]
      : []),
    ...(topFee
      ? [
          {
            title: i18n.t('nav.borrow'),
            description: i18n.t('nav.tokens-borrow', {
              token,
              fee: formatDecimalAsPercent(new BigNumber(topFee.fee ?? 0)),
            }),
            url: `${INTERNAL_LINKS.borrow}?collateral-token=${token}`,
          },
        ]
      : []),
  ]
}
