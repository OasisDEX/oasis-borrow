import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import { NavigationActionsController } from 'features/navigation/controls/NavigationActionsController'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getAppConfig } from 'helpers/config'
import { useAccount } from 'helpers/useAccount'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function NavigationController() {
  const { t } = useTranslation()
  const { NewNavigation: isNewNavigationEnabled } = getAppConfig('features')
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3] - 1}px)`)

  return (
    <>
      <Navigation
        links={[
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
                      list: {
                        items: [],
                      },
                      title: t('nav.earn'),
                      description: t('nav.products-earn'),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: t('nav.multiply'),
                      description: t('nav.products-multiply'),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: t('nav.borrow'),
                      description: t('nav.products-borrow'),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: t('nav.swap-and-bridge'),
                      description: t('nav.products-swap-and-bridge'),
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
                            title: (
                              <>
                                <Icon
                                  name="star"
                                  size={16}
                                  sx={{ mr: 1, verticalAlign: 'text-top' }}
                                />
                                Amplify sDAI up to 35x.
                              </>
                            ),
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
                      title: 'Aave',
                      icon: {
                        source: lendingProtocolsByName[LendingProtocol.AaveV3].icon,
                        position: 'title',
                        type: 'image',
                      },
                      hoverColor: 'linear-gradient(230deg, #B6509E 15.42%, #2EBAC6 84.42%)',
                      description: t('nav.protocols-aave'),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'Ajna',
                      icon: {
                        source: lendingProtocolsByName[LendingProtocol.Ajna].icon,
                        position: 'title',
                        type: 'image',
                      },
                      hoverColor: 'linear-gradient(90deg, #F154DB 0%, #974EEA 100%)',
                      description: (
                        <Trans i18nKey="nav.protocols-ajna" components={{ br: <br /> }} />
                      ),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'Maker',
                      icon: {
                        source: lendingProtocolsByName[LendingProtocol.Maker].icon,
                        position: 'title',
                        type: 'image',
                      },
                      hoverColor: 'linear-gradient(135deg, #2DC1B1 0%, #139D8D 100%)',
                      description: (
                        <Trans i18nKey="nav.protocols-maker" components={{ br: <br /> }} />
                      ),
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'Spark',
                      icon: {
                        source: lendingProtocolsByName[LendingProtocol.SparkV3].icon,
                        position: 'title',
                        type: 'image',
                      },
                      hoverColor: 'linear-gradient(159deg, #F58013 12.26%, #F19D19 86.52%)',
                      description: (
                        <Trans i18nKey="nav.protocols-spark" components={{ br: <br /> }} />
                      ),
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
                      list: {
                        items: [],
                      },
                      title: 'ETH',
                      icon: {
                        source: getToken('ETH').iconCircle,
                        position: 'title',
                        type: 'icon',
                      },
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'stETH',
                      icon: {
                        source: getToken('STETH').iconCircle,
                        position: 'title',
                        type: 'icon',
                      },
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'rETH',
                      icon: {
                        source: getToken('RETH').iconCircle,
                        position: 'title',
                        type: 'icon',
                      },
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'cbETH',
                      icon: {
                        source: getToken('CBETH').iconCircle,
                        position: 'title',
                        type: 'icon',
                      },
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'DAI',
                      icon: {
                        source: getToken('DAI').iconCircle,
                        position: 'title',
                        type: 'icon',
                      },
                    },
                  ],
                  tight: true,
                },
                {
                  header: t('nav.tokens-new'),
                  items: [
                    {
                      list: {
                        items: [],
                      },
                      title: 'sDAI',
                      icon: {
                        source: getToken('SDAI').iconCircle,
                        position: 'title',
                        type: 'icon',
                      },
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'GHO',
                      icon: {
                        source: getToken('GHO').iconCircle,
                        position: 'title',
                        type: 'icon',
                      },
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'TBTC',
                      icon: {
                        source: getToken('TBTC').iconCircle,
                        position: 'title',
                        type: 'icon',
                      },
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
                      list: {
                        items: [],
                      },
                      title: 'Get Liquidity Without Selling Your Crypto',
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'Amplify Exposure to your Crypto with downside protection',
                    },
                    {
                      list: {
                        items: [],
                      },
                      title: 'Maximize Earnings on your Crypto Assets',
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
