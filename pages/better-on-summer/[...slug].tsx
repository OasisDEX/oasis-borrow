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
    ],
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...marketingTemplatePageProps,
    },
  }
}
