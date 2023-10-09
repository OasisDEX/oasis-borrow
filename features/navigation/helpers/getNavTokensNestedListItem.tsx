import BigNumber from 'bignumber.js'
import type { NavigationMenuPanelList } from 'components/navigation/Navigation.types'
import { ProductHubProductType } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { capitalize } from 'lodash'
import { Trans } from 'next-i18next'
import React from 'react'
import type { TranslationType } from 'ts_modules/i18next'

type NavTokensNestedListParams = {
  fee: number
  maxMultiple: number
  apyPassive: number
  apyActive: number
}

export const getNavTokensNestedListItem = (
  t: TranslationType,
  token: string,
  { fee, apyPassive, apyActive, maxMultiple }: NavTokensNestedListParams,
): NavigationMenuPanelList => {
  return {
    items: [
      {
        title: t('nav.borrow'),
        description: (
          <Trans
            i18nKey="nav.tokens-borrow"
            values={{ token, fee: formatDecimalAsPercent(new BigNumber(fee)) }}
            components={{ em: <em /> }}
          />
        ),
        url: `${INTERNAL_LINKS.borrow}/${getTokenGroup(token)}`,
      },
      {
        title: t('nav.multiply'),
        description: (
          <Trans
            i18nKey={maxMultiple === 0 ? 'nav.tokens-multiply-simple' : 'nav.tokens-multiply'}
            values={{
              token,
              maxMultiple: maxMultiple.toFixed(2),
              product: capitalize(ProductHubProductType.Multiply),
            }}
            components={{ em: <em /> }}
          />
        ),
        url: `${INTERNAL_LINKS.multiply}/${getTokenGroup(token)}`,
      },
      {
        title: t('nav.earn'),
        description: (
          <Trans
            i18nKey={
              apyPassive === 0 && apyActive === 0
                ? 'nav.tokens-earn-on-actively'
                : `nav.tokens-earn${
                    apyPassive === 0 && apyActive !== 0
                      ? '-active'
                      : apyPassive !== 0 && apyActive === 0
                      ? '-passive'
                      : ''
                  }`
            }
            values={{
              token,
              apyPassive: formatDecimalAsPercent(new BigNumber(apyPassive)),
              apyActive: formatDecimalAsPercent(new BigNumber(apyActive)),
              apy:
                apyPassive === 0 && apyActive !== 0
                  ? formatDecimalAsPercent(new BigNumber(apyActive))
                  : apyPassive !== 0 && apyActive === 0
                  ? formatDecimalAsPercent(new BigNumber(apyPassive))
                  : undefined,
              product: capitalize(ProductHubProductType.Earn),
            }}
            components={{ em: <em /> }}
          />
        ),
        url: `${INTERNAL_LINKS.earn}/${getTokenGroup(token)}`,
      },
    ],
    link: {
      label: t('nav.tokens-more', { token }),
      url: `${INTERNAL_LINKS.earn}/${getTokenGroup(token)}`,
    },
  }
}
