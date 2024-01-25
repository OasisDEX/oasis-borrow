import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { SimpleCarousel } from 'components/SimpleCarousel'
import {
  MarketingTemplateBenefitBox,
  MarketingTemplateHero,
  MarketingTemplateProduct,
} from 'features/marketing-layouts/components'
import { getGridTemplateAreas } from 'features/marketing-layouts/helpers'
import type { MarketingTemplatePageProps } from 'features/marketing-layouts/types'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Grid, Heading } from 'theme-ui'

function BetterOnSummerPage({
  benefits,
  benefitsSubtitle,
  benefitsTitle,
  hero,
  palette,
  products,
}: MarketingTemplatePageProps) {
  return (
    <MarketingLayout topBackground="none" backgroundGradient={palette.mainGradient}>
      <Box sx={{ width: '100%' }}>
        <MarketingTemplateHero {...hero} />
        <Grid
          sx={{
            gap: 3,
            gridTemplateAreas: getGridTemplateAreas(products),
          }}
        >
          {products.map((product, i) => (
            <MarketingTemplateProduct
              key={i}
              i={i}
              mainGradient={palette.mainGradient}
              {...product}
            />
          ))}
        </Grid>
        <SimpleCarousel
          header={
            <Box>
              <Heading as="h3" variant="header4" sx={getGradientColor(summerBrandGradient)}>
                {benefitsSubtitle}
              </Heading>
              <Heading as="h2" variant="header2" sx={{ mt: 3 }}>
                {benefitsTitle}
              </Heading>
            </Box>
          }
          slidesToDisplay={2}
          overflow="visible"
          slides={benefits.map((benefit, i) => (
            <MarketingTemplateBenefitBox key={i} {...benefit} {...palette.icon} />
          ))}
        />
      </Box>
    </MarketingLayout>
  )
}

export default BetterOnSummerPage

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  // TODO - to be replaced with API call
  const palette: MarketingTemplatePageProps['palette'] = {
    mainGradient: ['#f8eaff', '#edf8ff'],
    icon: {
      backgroundGradient: ['#f6e3ff', '#d9f0f4'],
      foregroundGradient: ['#ecb6df', '#f6f1ff', '#afd7db'],
      symbolGradient: ['#2ebac6', '#b6509e'],
    },
  }

  const hero: MarketingTemplatePageProps['hero'] = {
    protocol: LendingProtocol.AaveV3,
    title: 'AAVE, with superpowers',
    description:
      "Earn interest, Borrow Assets and Multiply Exposure with DeFi's leading liquidity protocol. Made even better with Summer.fi's Superpowers of one click actions, advanced automations and unified frontend gateway to the best of DeFi.",
    link: { label: 'Open a position', url: '/' },
    image: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-hero.png'),
  }

  const products: MarketingTemplatePageProps['products'] = [
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
      type: 'Borrow',
      title: 'Get liquidity from your crypto without selling',
      description:
        'Borrow vaults on Compound allow you to use your crypto as collateral and borrow USDC, competitive rates.',
    },
  ]

  const benefitsSubtitle = 'The Summer.fi Superpowers'
  const benefitsTitle = 'Why use Aave on  Summer.fi?'
  const benefits: MarketingTemplatePageProps['benefits'] = [
    {
      icon: 'sleep',
      title: 'Never lose another nights sleep',
      description: 'Automated risk management tools protect your positions from liquidation. ',
      list: ['Stop Loss', 'Auto Sell'],
    },
    {
      icon: 'sleep',
      title: 'Bundling is better',
      description:
        'Stop wasting time doing common actions repetitively just to achieve a simple goal. Summer.fi takes care of the convenience so you can just focus on your assets.',
      list: [
        'One click actions for all your most common and annoying transactions',
        'Bundled transactions',
      ],
    },
    {
      icon: 'sleep',
      title: 'Set and forget your strategy',
      description:
        'Automated tools allow you to convenience of your strategy once, and summer.fi super powers do the work.',
      list: ['Auto Buy', 'Auto Take Profit'],
    },
    {
      icon: 'sleep',
      title: 'Everything you need, all in one place',
      list: [
        'Unlock the superpowers of other protocols',
        'View all your positions and assets at glance',
        'Discover new curated DeFi opportunities',
        'Swap and Bridge.',
      ],
    },
  ]

  const marketingLayoutProps: MarketingTemplatePageProps = {
    benefits,
    benefitsSubtitle,
    benefitsTitle,
    products,
    hero,
    palette,
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...marketingLayoutProps,
    },
  }
}
