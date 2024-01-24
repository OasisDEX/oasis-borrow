import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { SimpleCarousel } from 'components/SimpleCarousel'
import { IconWithPalette, MarketingTemplateHero } from 'features/marketing-layouts/components'
import { sleep } from 'features/marketing-layouts/icons'
import type {
  MarketingLayoutPageProps,
  MarketingLayoutPalette,
} from 'features/marketing-layouts/types'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

function BetterOnSummerPage({ palette }: MarketingLayoutPageProps) {
  return (
    <MarketingLayout topBackground="none" backgroundGradient={palette.mainGradient}>
      <Box sx={{ width: '100%' }}>
        <MarketingTemplateHero
          protocol={LendingProtocol.AaveV3}
          title="AAVE, with superpowers"
          description="Earn interest, Borrow Assets and Multiply Exposure with DeFi's leading liquidity protocol. Made even better with Summer.fi's Superpowers of one click actions, advanced automations and unified frontend gateway to the best of DeFi."
          link={{ label: 'Open a position', url: '/' }}
          image={staticFilesRuntimeUrl('/static/img/marketing-layout/temp-hero.png')}
        />
        <Box>
          <IconWithPalette size={80} contents={sleep} {...palette.icon} />
        </Box>
        <SimpleCarousel
          header={
            <Box>
              <Heading>Heading</Heading>
              <Text>Lorem ipsum dolor sit amet</Text>
            </Box>
          }
          slidesToDisplay={2}
          overflow="visible"
          slides={[
            <Box sx={{ bg: 'red', width: '100%' }}>test</Box>,
            <Box sx={{ bg: 'blue', width: '100%' }}>test</Box>,
            <Box sx={{ bg: 'pink', width: '100%' }}>test</Box>,
            <Box sx={{ bg: 'green', width: '100%' }}>test</Box>,
            <Box sx={{ bg: 'yellow', width: '100%' }}>test</Box>,
          ]}
        />
      </Box>
    </MarketingLayout>
  )
}

export default BetterOnSummerPage

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  // TODO - to be replaced with API call
  const palette: MarketingLayoutPalette = {
    mainGradient: ['#f8eaff', '#edf8ff'],
    icon: {
      backgroundGradient: ['#f6e3ff', '#d9f0f4'],
      foregroundGradient: ['#ecb6df', '#f6f1ff', '#afd7db'],
      symbolGradient: ['#2ebac6', '#b6509e'],
    },
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      palette,
    },
  }
}
