import { NetworkNames } from 'blockchain/networks'
import { MarketingLayout } from 'components/layouts/MarketingLayout'
import type { MarketingTemplateFreeform } from 'features/marketing-layouts/types'
import { MarketingTemplateView } from 'features/marketing-layouts/views'
import { ProductHubProductType } from 'features/productHub/types'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

type MarketingTemplatePageProps = MarketingTemplateFreeform

function MarketingTemplatePage(props: MarketingTemplatePageProps) {
  const {
    palette: { background },
  } = props

  return (
    <MarketingLayout topBackground="none" backgroundGradient={background}>
      <MarketingTemplateView {...props} />
    </MarketingLayout>
  )
}

export default MarketingTemplatePage

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  const marketingTemplatePageProps: MarketingTemplateFreeform = {
    palette: {
      background: ['#f8eaff', '#edf8ff'],
      foreground: ['#2ebac6', '#b6509e'],
    },
    hero: {
      protocol: [LendingProtocol.AaveV2, LendingProtocol.AaveV3],
      title: 'AAVE, with superpowers',
      description:
        "Earn interest, Borrow Assets and Multiply Exposure with DeFi's leading liquidity protocol. Made even better with Summer.fi's Superpowers of one click actions, advanced automations and unified frontend gateway to the best of DeFi.",
      link: { label: 'Open a position', url: '/' },
      image: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-hero.png'),
    },
    blocks: [
      {
        type: 'product-finder',
        content: {
          product: ProductHubProductType.Multiply,
          initialProtocol: [LendingProtocol.AaveV2, LendingProtocol.AaveV3],
          promoCards: [
            {
              network: NetworkNames.arbitrumMainnet,
              primaryToken: 'RETH',
              secondaryToken: 'ETH',
              product: ProductHubProductType.Borrow,
              protocol: LendingProtocol.AaveV3,
            },
            {
              network: NetworkNames.optimismMainnet,
              primaryToken: 'WBTC',
              secondaryToken: 'USDC',
              product: ProductHubProductType.Multiply,
              protocol: LendingProtocol.AaveV3,
            },
            {
              network: NetworkNames.ethereumMainnet,
              primaryToken: 'STETH',
              secondaryToken: 'ETH',
              product: ProductHubProductType.Earn,
              protocol: LendingProtocol.AaveV2,
            },
          ],
        },
      },
      {
        type: 'info-box',
        title: "AAVE, but more approachable for DeFi novices and advanced Degen's",
        description:
          'Summer.fi turns the AAVE Protocol into an easy to access DeFi app. You can start simple with the depositing for yield, borrow a stablecoin against you crypto or do advanced automation strategies with Multiply to go long or short.',
        content: [
          {
            title: 'Endless Opportunities with AAVE',
            description:
              'The AAVE protocol on Summer.fi offers many different options for you, regardless of if you are new to DeFi or an experienced power user of DeFi protocols. ',
            image: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-info-1.png'),
          },
          {
            title:
              "Access DeFi yield with simple deposits on stablecoin's, a straightforward strategy to get started",
            description:
              'A great entry point to DeFi is earning on your assets. With aave you can lend by simply depositing in one click and start earning Fees.',
            link: {
              label: 'List of top assets',
              url: '/',
            },
            image: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-info-2.png'),
          },
          {
            title: 'Get paid to park (your capital)',
            description:
              'Another great entry point to DeFi is earning yield on your volatile crypto assets. Simply deposit in one click and start earning Fees.',
            image: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-info-3.png'),
            tokens: ['ETH', 'WSTETH', 'WBTC', 'USDC', 'USDT'],
          },
        ],
      },
      {
        type: 'product-box',
        title: 'The simplest way Borrow stables and Multiply your crypto',
        content: [
          {
            composition: 'narrow',
            type: 'Borrow',
            title: 'Get liquidity from your crypto without selling',
            description:
              "Borrow vaults on AAVE allow you to use your crypto as collateral and borrow other assets, usually stablecoin's. Meaning you can get access to dollar-like assets without selling a thing.",
            link: {
              label: 'Borrow',
              url: '/',
            },
            image: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-product-1.png'),
          },
          {
            composition: 'narrow',
            type: 'Multiply',
            title: 'Increase your exposure to your crypto and amplify your profits',
            description:
              'Multiply vaults allow you to increase your exposure to your collateral in a single click. Saving you time and gas costs.',
            image: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-product-2.png'),
            link: {
              label: 'Multiply',
              url: '/',
            },
          },
          {
            composition: 'wide',
            type: 'Staking',
            title: 'Seamless Staking Yield, but Enhanced with Summer.fi Superpowers',
            description:
              'Summer.fi makes it easy to enhance your staking returns up to 8x on compound, with our Yield Loop strategy, all from a custom dashboard with advanced analytics and made simple with one click management. ',
            link: {
              label: 'Staking',
              url: '/',
            },
            actionsList: [
              {
                icon: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-icon-1.png'),
                label: 'Deposit ETH or stETH',
              },
              {
                icon: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-icon-2.png'),
                label: 'Adjust your risk',
              },
              {
                icon: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-icon-3.png'),
                label: 'Loop borrowing ETH ',
                description: 'Abstracted away all with a single click',
              },
            ],
          },
        ],
      },
    ],
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...marketingTemplatePageProps,
    },
  }
}
