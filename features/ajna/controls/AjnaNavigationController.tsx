import { ConnectWalletButton } from 'components/navigation/content/ConnectWalletButton'
import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { NotificationsOrb } from 'components/navigation/content/NotificationsOrb'
import { SwapOrb } from 'components/navigation/content/SwapOrb'
import { WalletOrb } from 'components/navigation/content/WalletOrb'
import { Navigation } from 'components/navigation/Navigation'
import { useAccount } from 'helpers/useAccount'
import React from 'react'

export const otherAssets = [
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
]

export function AjnaNavigationController() {
  const { isConnected } = useAccount()

  return (
    <Navigation
      pill={{ label: 'Ajna', color: ['#f154db', '#974eea'] }}
      panels={[
        {
          label: 'Borrow',
          description: 'Borrow against your favorite crypto assets.',
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
          otherAssets,
        },
        {
          label: 'Multiply',
          description: 'Multiply your exposure to your favorite crypto assets.',
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
          label: 'Earn',
          description: 'Put your crypto assets to work today.',
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
                label: <MyPositionsLink />,
                link: '/my',
              },
            ]
          : []),
      ]}
      actions={
        isConnected ? (
          <>
            <SwapOrb />
            <NotificationsOrb />
            <WalletOrb />
          </>
        ) : (
          <ConnectWalletButton />
        )
      }
    />
  )
}
