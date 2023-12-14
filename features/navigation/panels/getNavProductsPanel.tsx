import { EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { networksByName } from 'blockchain/networks'
import type {
  NavigationMenuPanelListTags,
  NavigationMenuPanelType,
} from 'components/navigation/Navigation.types'
import { NavigationBridgeDescription } from 'features/navigation/components/NavigationBridgeDescription'
import {
  getNavIconConfig,
  getProductBorrowNavItems,
  getProductEarnNavItems,
  getProductMultiplyNavItems,
} from 'features/navigation/helpers'
import type { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import type { SwapWidgetChangeAction } from 'features/swapWidget/SwapWidgetChange'
import { SWAP_WIDGET_CHANGE_SUBJECT } from 'features/swapWidget/SwapWidgetChange'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { uiChanges } from 'helpers/uiChanges'
import { zero } from 'helpers/zero'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { capitalize } from 'lodash'
import React from 'react'
import { exchange } from 'theme/icons'
import { bridge } from 'theme/icons/bridge'
import type { TranslationType } from 'ts_modules/i18next'

export const getNavProductsPanel = ({
  t,
  productHubItems,
  promoCardsData,
  isConnected,
  connect,
}: {
  t: TranslationType
  promoCardsData: ProductHubPromoCards
  productHubItems: ProductHubItem[]
  isConnected: boolean
  connect: () => void
}): NavigationMenuPanelType => {
  const productEarnNavItems = getProductEarnNavItems(promoCardsData, productHubItems)
  const productMultiplyNavItems = getProductMultiplyNavItems(promoCardsData, productHubItems)
  const productBorrowNavItems = getProductBorrowNavItems(productHubItems)

  const widgetCallback = (variant: 'swap' | 'bridge') => {
    !isConnected && connect()
    uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
      type: 'open',
      variant,
    })
  }

  return {
    label: t('nav.products'),
    lists: [
      {
        items: [
          {
            title: t('nav.earn'),
            description: t('nav.products-earn'),
            url: INTERNAL_LINKS.earn,
            list: {
              items: [
                ...productEarnNavItems.map((item) => ({
                  title: t(item.weeklyNetApy ? 'nav.earn-on-your' : 'nav.earn-on-your-simple', {
                    token: item.reverseTokens ? item.primaryToken : item.secondaryToken,
                    apy: formatDecimalAsPercent(item.weeklyNetApy || zero),
                  }),

                  icon: getNavIconConfig({
                    tokens:
                      item.primaryToken === item.secondaryToken
                        ? [item.primaryToken]
                        : item.reverseTokens
                        ? [item.secondaryToken, item.primaryToken]
                        : [item.primaryToken, item.secondaryToken],
                    position: 'global',
                  }),
                  description:
                    item.earnStrategy === EarnStrategies.other
                      ? t('nav.earn-on-other-strategy', {
                          earnStrategyDescription: item.earnStrategyDescription,
                          token: item.primaryToken,
                        })
                      : item.earnStrategy === EarnStrategies.yield_loop
                      ? t('nav.earn-on-yield-loop-strategy', {
                          token: item.primaryToken,
                          protocol: item.protocol.toUpperCase(),
                        })
                      : t('nav.earn-on-liquidity-provision-strategy', {
                          token: item.primaryToken,
                          protocol: item.protocol.toUpperCase(),
                        }),
                  tags: [
                    [capitalize(item.protocol), lendingProtocolsByName[item.protocol].gradient],
                    [capitalize(item.network), networksByName[item.network].gradient],
                  ] as NavigationMenuPanelListTags,
                  url: item.url,
                })),
              ],
            },
          },
          {
            title: t('nav.multiply'),
            description: t('nav.products-multiply'),
            url: INTERNAL_LINKS.multiply,
            list: {
              items: [
                ...productMultiplyNavItems.map((item) => ({
                  title: t(item.maxMultiply ? 'nav.multiply-get-up-to' : 'nav.multiply-exposure', {
                    maxMultiply: item.maxMultiply?.toFixed(2),
                    collateralToken: item.collateralToken,
                    debtToken: item.debtToken,
                  }),
                  icon: getNavIconConfig({
                    tokens: [item.collateralToken, item.debtToken],
                    position: 'global',
                  }),
                  description: t('nav.increase-your-exposure-against', { token: item.debtToken }),
                  tags: [
                    [capitalize(item.protocol), lendingProtocolsByName[item.protocol].gradient],
                    [capitalize(item.network), networksByName[item.network].gradient],
                  ] as NavigationMenuPanelListTags,
                  url: item.url,
                })),
              ],
            },
          },
          {
            title: t('nav.borrow'),
            description: t('nav.products-borrow'),
            url: INTERNAL_LINKS.borrow,
            list: {
              items: [
                {
                  title: t('nav.borrow-up-to-ltv', {
                    maxLtv: formatDecimalAsPercent(
                      new BigNumber(productBorrowNavItems.maxLtv.value),
                    ),
                  }),
                  icon: getNavIconConfig({
                    tokens: [
                      productBorrowNavItems.maxLtv.primaryToken,
                      productBorrowNavItems.maxLtv.secondaryToken,
                    ],
                    position: 'global',
                  }),
                  description: t('nav.discover-the-highest-ltv'),
                  tags: [
                    [
                      capitalize(productBorrowNavItems.maxLtv.protocol),
                      lendingProtocolsByName[productBorrowNavItems.maxLtv.protocol].gradient,
                    ],
                    [
                      capitalize(productBorrowNavItems.maxLtv.network),
                      networksByName[productBorrowNavItems.maxLtv.network].gradient,
                    ],
                  ],
                  url: productBorrowNavItems.maxLtv.url,
                },
                {
                  title: t('nav.borrow-lowest-fee', {
                    token: productBorrowNavItems.fee.primaryToken,
                    fee: formatDecimalAsPercent(new BigNumber(productBorrowNavItems.fee.value)),
                  }),
                  icon: {
                    position: 'global',
                    tokens: [
                      productBorrowNavItems.fee.primaryToken,
                      productBorrowNavItems.fee.secondaryToken,
                    ],
                  },
                  description: t('nav.find-the-lowest-rates'),
                  tags: [
                    [
                      capitalize(productBorrowNavItems.fee.protocol),
                      lendingProtocolsByName[productBorrowNavItems.fee.protocol].gradient,
                    ],
                    [
                      capitalize(productBorrowNavItems.fee.network),
                      networksByName[productBorrowNavItems.fee.network].gradient,
                    ],
                  ],
                  url: productBorrowNavItems.fee.url,
                },
                {
                  title: t('nav.earn-rewards-while-borrowing'),
                  icon: {
                    position: 'global',
                    tokens: [
                      productBorrowNavItems.liquidity.primaryToken,
                      productBorrowNavItems.liquidity.secondaryToken,
                    ],
                  },
                  description: t('nav.get-paid-to-borrow'),
                  tags: [
                    [
                      capitalize(productBorrowNavItems.liquidity.protocol),
                      lendingProtocolsByName[productBorrowNavItems.liquidity.protocol].gradient,
                    ],
                    [
                      capitalize(productBorrowNavItems.liquidity.network),
                      networksByName[productBorrowNavItems.liquidity.network].gradient,
                    ],
                  ],
                  url: productBorrowNavItems.liquidity.url,
                },
              ],
            },
          },
          {
            title: t('nav.swap-and-bridge'),
            description: t('nav.products-swap-and-bridge'),
            list: {
              items: [
                {
                  title: t('nav.swap'),
                  icon: {
                    position: 'global',
                    icon: exchange,
                  },
                  description: t('nav.swap-description'),
                  callback: () => widgetCallback('swap'),
                },
                {
                  title: t('nav.bridge'),
                  icon: {
                    position: 'global',
                    icon: bridge,
                  },
                  description: <NavigationBridgeDescription />,
                  callback: () => widgetCallback('bridge'),
                },
              ],
            },
          },
        ],
      },
    ],
  }
}
