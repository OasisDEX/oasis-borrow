import { useAppContext } from 'components/AppContextProvider'
import { useVaultCount } from 'components/Header'
import { Navigation } from 'components/navigation/Navigation'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Spinner } from 'theme-ui'

export function AjnaNavigationController() {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)
  const vaultCount = useVaultCount()

  const isConnected = context?.status === 'connected'

  return (
    <Navigation
      panels={[
        {
          description: 'Borrow against your favorite crypto assets.',
          label: 'Borrow',
          learn: {
            label: 'Learn more about Borrow',
            link: 'https://kb.oasis.app/',
          },
          links: [
            {
              title: 'Borrow against ETH',
              icon: 'ether_circle_color',
              link: '/',
              footnote: (
                <>
                  Borrowing from as little as <strong>0.25%</strong> a year
                </>
              ),
            },
            {
              title: 'Borrow against stETH',
              icon: 'wsteth_circle_color',
              link: '/',
              footnote: 'Lorem ipsum dolor sit amet',
            },
            {
              title: 'Borrow against BTC',
              icon: 'btc_circle_color',
              link: '/',
              footnote: (
                <>
                  Borrowing from as little as <strong>0.25%</strong> a year
                </>
              ),
            },
            {
              title: 'Borrow against CRV',
              icon: 'curve_full_circle_color',
              link: '/',
              footnote: 'Donec consectetur tellus quis augue vehicula lobortis',
            },
          ],
          otherAssets: [
            {
              token: 'AAVE',
              link: '/',
            },
            {
              token: 'BAL',
              link: '/',
            },
            {
              token: 'COMP',
              link: '/',
            },
            {
              token: 'LINK',
              link: '/',
            },
            {
              token: 'COMP',
              link: '/',
            },
            {
              token: 'MANA',
              link: '/',
            },
            {
              token: 'UNI',
              link: '/',
            },
            {
              token: 'YFI',
              link: '/',
            },
          ],
        },
        {
          description: 'Multiply your exposure to your favorite crypto assets.',
          label: 'Multiply',
          learn: {
            label: 'Learn more about Multiply',
            link: 'https://kb.oasis.app/',
          },
          links: [
            {
              title: 'Multiply your rETH',
              icon: 'reth_circle_color',
              link: '/',
              footnote: (
                <>
                  Get up to <strong>150%</strong> exposure
                </>
              ),
            },
            {
              title: 'Multiply your wBTC',
              icon: 'wbtc_circle_color',
              link: '/',
              footnote: 'Duis posuere nisl quis tellus iaculis consectetur',
            },
          ],
        },
        {
          description: 'Put your crypto assets to work today.',
          label: 'Earn',
          learn: {
            label: 'Learn more about Earn',
            link: 'https://kb.oasis.app/',
          },
          links: [
            {
              title: 'Earn on DAI',
              icon: 'dai_circle_color',
              link: '/',
              footnote: (
                <>
                  Average 90 day yield is <strong>22.3%</strong>
                </>
              ),
            },
            {
              title: 'Earn on USDC',
              icon: 'usdc_circle_color',
              link: '/',
              footnote: 'Proin vel nibh consectetur risus hendrerit suscipit',
            },
          ],
          otherAssets: [
            {
              token: 'AAVE',
              link: '/',
            },
          ],
        },
      ]}
      links={[
        {
          label: 'Ajna Tokens',
          link: '/ajna/tokens',
        },
        ...(isConnected
          ? [
              {
                label: (
                  <>
                    My positions (
                    {vaultCount !== null ? (
                      vaultCount
                    ) : (
                      <Spinner
                        size={14}
                        color={ajnaExtensionTheme.colors.neutral80}
                        sx={{ verticalAlign: 'text-bottom' }}
                      />
                    )}
                    )
                  </>
                ),
                link: '/my',
              },
            ]
          : []),
      ]}
      pill={{ label: 'Ajna', color: ['#f154db', '#974eea'] }}
    />
  )
}
