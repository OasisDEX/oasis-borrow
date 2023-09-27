import { BaseNetworkNames, networksByName } from 'blockchain/networks'
import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation } from 'components/navigation/Navigation'
import { navigationBreakpoints } from 'components/navigation/Navigation.constants'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import {
  type SwapWidgetChangeAction,
  SWAP_WIDGET_CHANGE_SUBJECT,
} from 'features/swapWidget/SwapWidgetChange'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { uiChanges } from 'helpers/uiChanges'
import { useAccount } from 'helpers/useAccount'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'
import { exchange } from 'theme/icons'
import { bridge } from 'theme/icons/bridge'
import type { TranslationType } from 'ts_modules/i18next'
import { useMediaQuery } from 'usehooks-ts'

function getTempNavTokensNestedListItem(t: TranslationType, token: string) {
  return {
    items: [
      {
        title: t('nav.borrow'),
        description: (
          <Trans
            i18nKey="nav.tokens-borow"
            values={{ token, fee: 0.97 }}
            components={{ em: <em /> }}
          />
        ),
        url: '/',
      },
      {
        title: t('nav.multiply'),
        description: (
          <Trans
            i18nKey="nav.tokens-multiply"
            values={{ token, maxMultiple: 14 }}
            components={{ em: <em /> }}
          />
        ),
        url: '/',
      },
      {
        title: t('nav.earn'),
        description: (
          <Trans
            i18nKey="nav.tokens-earn"
            values={{ token, apyPassive: 4.5, apyActive: 12.71 }}
            components={{ em: <em /> }}
          />
        ),
        url: '/',
      },
    ],
    link: {
      label: t('nav.tokens-more', { token }),
      url: '/',
    },
  }
}

export function NavigationController() {
  const { t } = useTranslation()
  const { NewNavigation: isNewNavigationEnabled } = useAppConfig('features')
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  return (
    <>
      <Navigation
        links={[
          ...(!isNewNavigationEnabled
            ? [
                {
                  label: 'Borrow',
                  link: INTERNAL_LINKS.borrow,
                },
                {
                  label: 'Multiply',
                  link: INTERNAL_LINKS.multiply,
                },
                {
                  label: 'Earn',
                  link: INTERNAL_LINKS.earn,
                },
              ]
            : []),
          ...(!isNewNavigationEnabled && isConnected && !isViewBelowXl
            ? [
                {
                  label: 'Swap',
                  onClick: () => {
                    uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
                      type: 'open',
                    })
                  },
                },
              ]
            : []),
          ...(isConnected && !isViewBelowXl
            ? [
                {
                  label: <MyPositionsLink />,
                  link: `/owner/${walletAddress}`,
                },
              ]
            : []),
        ]}
        {...(isNewNavigationEnabled && {
          panels: [
            {
              label: t('nav.products'),
              lists: [
                {
                  items: [
                    {
                      title: t('nav.earn'),
                      description: t('nav.products-earn'),
                      list: {
                        items: [
                          {
                            title: 'Earn 5% on your DAI',
                            icon: {
                              position: 'global',
                              tokens: ['DAI'],
                            },
                            description: 'Earn on DAI with the DAI Savings Rate',
                            tags: [
                              ['Maker', lendingProtocolsByName[LendingProtocol.Maker].gradient],
                              ['Ethereum', networksByName[BaseNetworkNames.Ethereum].gradient],
                            ],
                            url: '/',
                          },
                          {
                            title: 'Earn 0.57% on your USDC',
                            icon: {
                              position: 'global',
                              tokens: ['ETH', 'USDC'],
                            },
                            description: 'Lend USDC on AJNA',
                            tags: [
                              ['Ajna', lendingProtocolsByName[LendingProtocol.Ajna].gradient],
                              ['Ethereum', networksByName[BaseNetworkNames.Ethereum].gradient],
                            ],
                            url: '/',
                          },
                          {
                            title: 'Earn 7.32% on your ETH',
                            icon: {
                              position: 'global',
                              tokens: ['WSTETH', 'ETH'],
                            },
                            description: 'Yield Loop wstETH on AAVE',
                            tags: [
                              ['Aave v3', lendingProtocolsByName[LendingProtocol.AaveV3].gradient],
                              ['Ethereum', networksByName[BaseNetworkNames.Ethereum].gradient],
                            ],
                            url: '/',
                          },
                        ],
                        link: {
                          label: t('nav.products-more', { product: t('nav.earn') }),
                          url: '/',
                        },
                      },
                    },
                    {
                      title: t('nav.multiply'),
                      description: t('nav.products-multiply'),
                      list: {
                        items: [
                          {
                            title: 'Get up to 3.8x on your WSTETH',
                            icon: {
                              position: 'global',
                              tokens: ['WSTETH', 'USDC'],
                            },
                            description: 'Increase your exposure against USDC',
                            tags: [
                              ['Ajna', lendingProtocolsByName[LendingProtocol.Ajna].gradient],
                              ['Ethereum', networksByName[BaseNetworkNames.Ethereum].gradient],
                            ],
                            url: '/',
                          },
                          {
                            title: 'Get up to 3.7x on your WBTC',
                            icon: {
                              position: 'global',
                              tokens: ['WBTC', 'USDC'],
                            },
                            description: 'Increase your exposure against USDC',
                            tags: [
                              ['Aave v3', lendingProtocolsByName[LendingProtocol.AaveV3].gradient],
                              ['Optimism', networksByName[BaseNetworkNames.Optimism].gradient],
                            ],
                            url: '/',
                          },
                          {
                            title: 'Get up to 4.3x on your ETH',
                            icon: {
                              position: 'global',
                              tokens: ['ETH', 'DAI'],
                            },
                            description: 'Increase your exposure against DAI',
                            tags: [
                              ['Maker', lendingProtocolsByName[LendingProtocol.Maker].gradient],
                              ['Ethereum', networksByName[BaseNetworkNames.Ethereum].gradient],
                            ],
                            url: '/',
                          },
                        ],
                        link: {
                          label: t('nav.products-more', { product: t('nav.multiply') }),
                          url: '/',
                        },
                      },
                    },
                    {
                      title: t('nav.borrow'),
                      description: t('nav.products-borrow'),
                      list: {
                        items: [
                          {
                            title: 'Borrow up to 80% LTV',
                            icon: {
                              position: 'global',
                              tokens: ['ETH', 'DAI'],
                            },
                            description: 'Discover the highest LTVs available',
                            tags: [
                              ['Maker', lendingProtocolsByName[LendingProtocol.Maker].gradient],
                              ['Ethereum', networksByName[BaseNetworkNames.Ethereum].gradient],
                            ],
                            url: '/',
                          },
                          {
                            title: 'Borrow against ETH from 2.3% a year',
                            icon: {
                              position: 'global',
                              tokens: ['WSTETH', 'DAI'],
                            },
                            description: 'Find the lowest rates to borrow',
                            tags: [
                              ['Maker', lendingProtocolsByName[LendingProtocol.Maker].gradient],
                              ['Ethereum', networksByName[BaseNetworkNames.Ethereum].gradient],
                            ],
                            url: '/',
                          },
                          {
                            title: 'Earn rewards while borrowing',
                            icon: {
                              position: 'global',
                              tokens: ['ETH', 'USDC'],
                            },
                            description: 'Get paid to borrow',
                            tags: [
                              ['Ajna', lendingProtocolsByName[LendingProtocol.Ajna].gradient],
                              ['Ethereum', networksByName[BaseNetworkNames.Ethereum].gradient],
                            ],
                            url: '/',
                          },
                        ],
                        link: {
                          label: t('nav.products-more', { product: t('nav.borrow') }),
                          url: '/',
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
                              icon: exchange,
                            },
                            description: t('nav.swap-description'),
                            url: '/',
                          },
                          {
                            title: t('nav.bridge'),
                            icon: {
                              position: 'global',
                              icon: bridge,
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
            },
            {
              label: t('nav.protocols'),
              lists: [
                {
                  items: [
                    {
                      title: 'Aave',
                      icon: {
                        image: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
                        position: 'title',
                      },
                      hoverColor: lendingProtocolsByName[LendingProtocol.AaveV3].gradient,
                      description: t('nav.protocols-aave'),
                      list: {
                        items: [
                          {
                            title: t('nav.borrow'),
                            description:
                              'Borrow against ETH, WBTC, DAI and any other type of collateral.',
                            url: '/',
                          },
                          {
                            title: t('nav.multiply'),
                            description:
                              'Increase exposure to ETH, WBTC, DAI and more; access top risk management tools.',
                            url: '/',
                          },
                          {
                            title: t('nav.earn'),
                            description:
                              'Earn yield on ETH, WBTC, DAI and more;  get exclusive token rewards.',
                            url: '/',
                          },
                          {
                            title: 'Amplify sDAI up to 35x',
                            promoted: true,
                            description:
                              'Use Summer.fi multiply to increase your exposure to sDAI yield seamlessly.',
                            url: '/',
                          },
                        ],
                        link: {
                          label: t('nav.protocols-more', { protocol: 'Aave' }),
                          url: '/',
                        },
                      },
                    },
                    {
                      title: 'Ajna',
                      icon: {
                        image: lendingProtocolsByName[LendingProtocol.Ajna].icon,
                        position: 'title',
                      },
                      hoverColor: lendingProtocolsByName[LendingProtocol.Ajna].gradient,
                      description: (
                        <Trans i18nKey="nav.protocols-ajna" components={{ br: <br /> }} />
                      ),
                      list: {
                        items: [
                          {
                            title: t('nav.borrow'),
                            description:
                              'Borrow against ETH, WBTC, DAI and any other type of collateral.',
                            url: '/',
                          },
                          {
                            title: t('nav.multiply'),
                            description:
                              'Increase exposure to ETH, WBTC, DAI and more; access top risk management tools.',
                            url: '/',
                          },
                          {
                            title: t('nav.earn'),
                            description:
                              'Earn yield on ETH, WBTC, DAI and more;  get exclusive token rewards.',
                            url: '/',
                          },
                          {
                            title: 'Amplify sDAI up to 35x',
                            promoted: true,
                            description:
                              'Use Summer.fi multiply to increase your exposure to sDAI yield seamlessly.',
                            url: '/',
                          },
                        ],
                        link: {
                          label: t('nav.protocols-more', { protocol: 'Ajna' }),
                          url: '/',
                        },
                      },
                    },
                    {
                      title: 'Maker',
                      icon: {
                        image: lendingProtocolsByName[LendingProtocol.Maker].icon,
                        position: 'title',
                      },
                      hoverColor: lendingProtocolsByName[LendingProtocol.Maker].gradient,
                      description: (
                        <Trans i18nKey="nav.protocols-maker" components={{ br: <br /> }} />
                      ),
                      list: {
                        items: [
                          {
                            title: t('nav.borrow'),
                            description:
                              'Borrow against ETH, WBTC, DAI and any other type of collateral.',
                            url: '/',
                          },
                          {
                            title: t('nav.multiply'),
                            description:
                              'Increase exposure to ETH, WBTC, DAI and more; access top risk management tools.',
                            url: '/',
                          },
                          {
                            title: t('nav.earn'),
                            description:
                              'Earn yield on ETH, WBTC, DAI and more;  get exclusive token rewards.',
                            url: '/',
                          },
                          {
                            title: 'Amplify sDAI up to 35x',
                            promoted: true,
                            description:
                              'Use Summer.fi multiply to increase your exposure to sDAI yield seamlessly.',
                            url: '/',
                          },
                        ],
                        link: {
                          label: t('nav.protocols-more', { protocol: 'Maker' }),
                          url: '/',
                        },
                      },
                    },
                    {
                      title: 'Spark',
                      icon: {
                        image: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
                        position: 'title',
                      },
                      hoverColor: lendingProtocolsByName[LendingProtocol.SparkV3].gradient,
                      description: (
                        <Trans i18nKey="nav.protocols-spark" components={{ br: <br /> }} />
                      ),
                      list: {
                        items: [
                          {
                            title: t('nav.borrow'),
                            description:
                              'Borrow against ETH, WBTC, DAI and any other type of collateral.',
                            url: '/',
                          },
                          {
                            title: t('nav.multiply'),
                            description:
                              'Increase exposure to ETH, WBTC, DAI and more; access top risk management tools.',
                            url: '/',
                          },
                          {
                            title: t('nav.earn'),
                            description:
                              'Earn yield on ETH, WBTC, DAI and more;  get exclusive token rewards.',
                            url: '/',
                          },
                          {
                            title: 'Amplify sDAI up to 35x',
                            promoted: true,
                            description:
                              'Use Summer.fi multiply to increase your exposure to sDAI yield seamlessly.',
                            url: '/',
                          },
                        ],
                        link: {
                          label: t('nav.protocols-more', { protocol: 'Spark' }),
                          url: '/',
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              label: t('nav.tokens'),
              lists: [
                {
                  header: t('nav.tokens-popular'),
                  items: [
                    {
                      title: 'ETH',
                      icon: {
                        tokens: ['ETH'],
                        position: 'title',
                      },
                      list: getTempNavTokensNestedListItem(t, 'ETH'),
                    },
                    {
                      title: 'stETH',
                      icon: {
                        tokens: ['STETH'],
                        position: 'title',
                      },
                      list: getTempNavTokensNestedListItem(t, 'stETH'),
                    },
                    {
                      title: 'rETH',
                      icon: {
                        tokens: ['RETH'],
                        position: 'title',
                      },
                      list: getTempNavTokensNestedListItem(t, 'rETH'),
                    },
                    {
                      title: 'cbETH',
                      icon: {
                        tokens: ['CBETH'],
                        position: 'title',
                      },
                      list: getTempNavTokensNestedListItem(t, 'cbETH'),
                    },
                    {
                      title: 'DAI',
                      icon: {
                        tokens: ['DAI'],
                        position: 'title',
                      },
                      list: getTempNavTokensNestedListItem(t, 'DAI'),
                    },
                    {
                      title: 'WBTC',
                      icon: {
                        tokens: ['WBTC'],
                        position: 'title',
                      },
                      list: getTempNavTokensNestedListItem(t, 'WBTC'),
                    },
                    {
                      title: 'USDC',
                      icon: {
                        tokens: ['USDC'],
                        position: 'title',
                      },
                      list: getTempNavTokensNestedListItem(t, 'USDC'),
                    },
                  ],
                  tight: true,
                },
                {
                  header: t('nav.tokens-new'),
                  items: [
                    {
                      title: 'sDAI',
                      icon: {
                        tokens: ['SDAI'],
                        position: 'title',
                      },
                      list: getTempNavTokensNestedListItem(t, 'sDAI'),
                    },
                  ],
                  link: {
                    label: t('nav.tokens-link'),
                    url: INTERNAL_LINKS.ajnaPoolFinder,
                  },
                  tight: true,
                },
              ],
            },
            {
              label: t('nav.use-cases'),
              lists: [
                {
                  items: [
                    {
                      title: 'Get Liquidity Without Selling Your Crypto',
                      list: {
                        items: [
                          {
                            title: 'Lorem ipsum dolor sit amet',
                            description:
                              'Aliquet aliquet dictum ut purus feugiat. At pellentesque blandit et maecenas lacus aliquam risus. Sit sed aliquam vitae pharetra nam et. Quis nec ac arcu augue tellus. Egestas pretium in massa ut eget.',
                          },
                        ],
                        link: {
                          label: t('read-more'),
                          url: '/',
                        },
                      },
                    },
                    {
                      title: 'Amplify Exposure to your Crypto with downside protection',
                      list: {
                        items: [
                          {
                            title: 'Fusce mi elit, facilisis eget odio ac',
                            description:
                              'Maecenas mollis, elit ut eleifend vulputate, turpis lacus porta sapien, eget tincidunt mi dui et elit. Nunc non arcu in velit commodo dapibus, facilisis interdum odio.',
                          },
                        ],
                        link: {
                          label: t('read-more'),
                          url: '/',
                        },
                      },
                    },
                    {
                      title: 'Maximize Earnings on your Crypto Assets',
                      list: {
                        items: [
                          {
                            title: 'In bibendum massa in viverra tempus',
                            description:
                              'Nullam vitae efficitur nisl, nec commodo urna. Etiam gravida lobortis libero, et tincidunt ante tincidunt at. Duis tortor turpis, malesuada lobortis risus quis, tempus efficitur risus.',
                          },
                        ],
                        link: {
                          label: t('read-more'),
                          url: '/',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        })}
        actions={<NavigationActionsController isConnected={isConnected} />}
      />
      <SwapWidgetShowHide />
    </>
  )
}
