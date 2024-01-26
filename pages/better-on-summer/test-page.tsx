import { NetworkNames } from 'blockchain/networks'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { SimpleCarousel } from 'components/SimpleCarousel'
import {
  MarketingTemplateBenefitBox,
  MarketingTemplateHero,
  MarketingTemplateProduct,
} from 'features/marketing-layouts/components'
import { getGridTemplateAreas } from 'features/marketing-layouts/helpers'
import type { MarketingTemplatePageProps } from 'features/marketing-layouts/types'
import { ProductHubPromoCardsList } from 'features/productHub/components/ProductHubPromoCardsList'
import { getGenericPromoCard } from 'features/productHub/helpers'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
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
  productFinder,
  products,
  productsTitle,
}: MarketingTemplatePageProps) {
  const {
    productHub: { table },
  } = usePreloadAppDataContext()

  const promoCards = table
    .filter((product) =>
      productFinder.promoCards.some(
        (filters) =>
          product.network === filters.network &&
          product.protocol === filters.protocol &&
          product.product.includes(filters.product) &&
          product.primaryToken.toLowerCase() === filters.primaryToken.toLowerCase() &&
          product.secondaryToken.toLowerCase() === filters.secondaryToken.toLowerCase(),
      ),
    )
    .map((product) => getGenericPromoCard({ product }))

  return (
    <MarketingLayout topBackground="none" backgroundGradient={palette.mainGradient}>
      <Box sx={{ width: '100%' }}>
        <MarketingTemplateHero {...hero} />
        <Box sx={{ mt: 7 }}>
          <ProductHubView
            headerGradient={palette.icon.symbolGradient}
            promoCardsCollection="Home"
            promoCardsPosition="none"
            limitRows={10}
            {...productFinder}
          />
          <ProductHubPromoCardsList promoCards={promoCards} />
        </Box>
        <Heading as="h2" variant="header2" sx={{ mb: 5, textAlign: 'center' }}>
          {productsTitle}
        </Heading>
        <Grid
          sx={{
            gap: 3,
            gridTemplateColumns: ['100%', 'unset'],
            gridTemplateAreas: ['unset', getGridTemplateAreas(products)],
          }}
        >
          {products.map((product, i) => (
            <MarketingTemplateProduct key={i} index={i} {...palette} {...product} />
          ))}
        </Grid>
        <SimpleCarousel
          header={
            <Box sx={{ mt: 7 }}>
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

  const productFinder: MarketingTemplatePageProps['productFinder'] = {
    product: ProductHubProductType.Multiply,
    initialProtocol: [LendingProtocol.AaveV2, LendingProtocol.AaveV3],
    promoCards: [
      {
        network: NetworkNames.ethereumMainnet,
        primaryToken: 'WSTETH',
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
        network: NetworkNames.baseMainnet,
        primaryToken: 'CBETH',
        secondaryToken: 'ETH',
        product: ProductHubProductType.Earn,
        protocol: LendingProtocol.AaveV3,
      },
    ],
  }

  const productsTitle = 'The simplest way Borrow stables and Multiply your crypto'
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
          icon: 'sleep',
          label: 'Deposit ETH or stETH',
        },
        {
          icon: 'sleep',
          label: 'Adjust your risk',
        },
        {
          icon: 'sleep',
          label: 'Loop borrowing ETH ',
          description: 'Abstracted away all with a single click',
        },
      ],
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
    productFinder,
    products,
    productsTitle,
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
