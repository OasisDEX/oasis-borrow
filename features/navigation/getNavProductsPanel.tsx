import { EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { BaseNetworkNames, networksByName } from 'blockchain/networks'
import type {
  NavigationMenuPanelListTags,
  NavigationMenuPanelType,
} from 'components/navigation/NavigationMenuPanel'
import {
  getNavIconConfig,
  getProductBorrowNavItems,
  getProductEarnNavItems,
  getProductMultiplyNavItems,
} from 'features/navigation/helpers'
import type { ProductHubItem, ProductHubPromoCards } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { capitalize } from 'lodash'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'
import type { TranslationType } from 'ts_modules/i18next'

export const getNavProductsPanel = ({
  t,
  productHubItems,
  promoCardsData,
}: {
  t: TranslationType
  promoCardsData: ProductHubPromoCards
  productHubItems: ProductHubItem[]
}): NavigationMenuPanelType => {
  const productMultiplyNavItems = getProductMultiplyNavItems(promoCardsData, productHubItems)

  const productEarnNavItems = getProductEarnNavItems(promoCardsData, productHubItems)
  const productBorrowNavItems = getProductBorrowNavItems(productHubItems)

  return {
    label: t('nav.products'),
    lists: [
      {
        items: [
          {
            title: t('nav.earn'),
            description: t('nav.products-earn'),
            list: {
              items: [
                ...productEarnNavItems.map((item) => ({
                  title: t('nav.earn-on-your', {
                    token: item.reverseTokens ? item.primaryToken : item.secondaryToken,
                    apy: formatDecimalAsPercent(item.weeklyNetApy),
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
                  url: `${INTERNAL_LINKS.earn}/${item.primaryToken}`,
                })),
              ],
              link: {
                label: t('nav.products-more', { product: t('nav.earn') }),
                url: INTERNAL_LINKS.earn,
              },
            },
          },
          {
            title: t('nav.multiply'),
            description: t('nav.products-multiply'),
            list: {
              items: [
                ...productMultiplyNavItems.map((item) => ({
                  title: item.maxMultiply
                    ? t('nav.multiply-get-up-to', {
                        maxMultiply: item.maxMultiply.toFixed(2),
                        collateralToken: item.collateralToken,
                        debtToken: item.debtToken,
                      })
                    : t('nav.multiply-exposure', {
                        collateralToken: item.collateralToken,
                        debtToken: item.debtToken,
                      }),
                  icon: getNavIconConfig({
                    tokens: [item.collateralToken, item.debtToken],
                    position: 'global',
                  }),
                  description: `Increase your exposure against ${item.debtToken}`,
                  tags: [
                    [capitalize(item.protocol), lendingProtocolsByName[item.protocol].gradient],
                    [capitalize(item.network), networksByName[item.network].gradient],
                  ] as NavigationMenuPanelListTags,
                  url: `${INTERNAL_LINKS.multiply}/${item.collateralToken}`,
                })),
              ],
              link: {
                label: t('nav.products-more', { product: t('nav.multiply') }),
                url: INTERNAL_LINKS.multiply,
              },
            },
          },
          {
            title: t('nav.borrow'),
            description: t('nav.products-borrow'),
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
                  url: `${INTERNAL_LINKS.borrow}/${getTokenGroup(
                    productBorrowNavItems.maxLtv.primaryToken,
                  )}`,
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
                  url: `${INTERNAL_LINKS.borrow}/${getTokenGroup(
                    productBorrowNavItems.fee.primaryToken,
                  )}`,
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
                  url: `${INTERNAL_LINKS.borrow}/${getTokenGroup(
                    productBorrowNavItems.liquidity.primaryToken,
                  )}`,
                },
              ],
              link: {
                label: t('nav.products-more', { product: t('nav.borrow') }),
                url: INTERNAL_LINKS.borrow,
              },
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
                    icon: 'exchange',
                  },
                  description: t('nav.swap-description'),
                  url: '/',
                },
                {
                  title: t('nav.bridge'),
                  icon: {
                    position: 'global',
                    icon: 'bridge',
                  },
                  description: (
                    <>
                      {t('nav.bridge-description')}
                      <Flex
                        as="ul"
                        sx={{
                          mt: '14px',
                          ml: 0,
                          p: 0,
                          listStyle: 'none',
                          columnGap: '14px',
                        }}
                      >
                        <Box as="li">
                          <Image
                            src={networksByName[BaseNetworkNames.Ethereum].icon}
                            width={20}
                            sx={{ verticalAlign: 'bottom' }}
                          />
                        </Box>
                        <Box as="li">
                          <Image
                            src={networksByName[BaseNetworkNames.Optimism].icon}
                            width={20}
                            sx={{ verticalAlign: 'bottom' }}
                          />
                        </Box>
                        <Box as="li">
                          <Image
                            src={networksByName[BaseNetworkNames.Arbitrum].icon}
                            width={20}
                            sx={{ verticalAlign: 'bottom' }}
                          />
                        </Box>
                      </Flex>
                    </>
                  ),
                  url: '/',
                },
              ],
            },
          },
        ],
      },
    ],
  }
}
