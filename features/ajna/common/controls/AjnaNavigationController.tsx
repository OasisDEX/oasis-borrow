import { MyPositionsLink } from 'components/navigation/content/MyPositionsLink'
import { MyPositionsOrb } from 'components/navigation/content/MyPositionsOrb'
import { NotificationsOrb } from 'components/navigation/content/NotificationsOrb'
import { WalletOrb } from 'components/navigation/content/WalletOrb'
import { WalletPanelMobile } from 'components/navigation/content/WalletPanelMobile'
import { Navigation, navigationBreakpoints } from 'components/navigation/Navigation'
import { NavigationPickNetwork } from 'components/navigation/NavigationPickNetwork'
import { ConnectButton } from 'features/web3OnBoard'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Flex } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

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
  const { isConnected, walletAddress } = useAccount()
  const isViewBelowXl = useMediaQuery(`(max-width: ${navigationBreakpoints[3]})`)
  const isViewBelowL = useMediaQuery(`(max-width: ${navigationBreakpoints[2]})`)
  const isViewBelowM = useMediaQuery(`(max-width: ${navigationBreakpoints[1]})`)
  const useNetworkSwitcher = useFeatureToggle('UseNetworkSwitcher')

  return (
    <Navigation
      pill={{ label: 'Ajna', color: ['#f154db', '#974eea'] }}
      panels={[
        {
          label: 'Borrow',
          link: INTERNAL_LINKS.ajnaBorrow,
          description: 'Borrow against your favorite crypto assets.',
          learn: {
            label: 'Learn more about Borrow',
            link: 'https://kb.oasis.app/',
          },
          links: [
            {
              title: 'Borrow against ETH',
              icon: 'ether_circle_color',
              link: INTERNAL_LINKS.ajnaBorrow,
              hash: 'ETH',
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
              link: INTERNAL_LINKS.ajnaBorrow,
              hash: 'WBTC',
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
          link: INTERNAL_LINKS.ajnaMultiply,
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
          link: INTERNAL_LINKS.ajnaEarn,
          description: 'Put your crypto assets to work today.',
          learn: {
            label: 'Learn more about Earn',
            link: 'https://kb.oasis.app/',
          },
          links: [
            {
              title: 'Earn on DAI',
              icon: 'dai_circle_color',
              link: INTERNAL_LINKS.ajnaEarn,
              hash: 'DAI',
              footnote: (
                <>
                  Average 90 day yield is <strong>22.3%</strong>
                </>
              ),
            },
            {
              title: 'Earn on USDC',
              icon: 'usdc_circle_color',
              link: INTERNAL_LINKS.ajnaEarn,
              hash: 'USDC',
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
          link: INTERNAL_LINKS.ajnaRewards,
        },
        ...(isConnected && !isViewBelowXl
          ? [
              {
                label: <MyPositionsLink />,
                link: `/owner/${walletAddress}`,
              },
            ]
          : []),
      ]}
      actions={
        isConnected ? (
          <>
            {isViewBelowXl && <MyPositionsOrb />}
            {/* <SwapOrb /> */}
            <NotificationsOrb />
            {useNetworkSwitcher ? <NavigationPickNetwork /> : null}
            {isViewBelowM ? <WalletPanelMobile /> : <WalletOrb />}
          </>
        ) : (
          <Flex sx={{ alignItems: 'center' }}>
            {useNetworkSwitcher ? <NavigationPickNetwork /> : null}
            {!isViewBelowL && <ConnectButton />}
          </Flex>
        )
      }
    />
  )
}
