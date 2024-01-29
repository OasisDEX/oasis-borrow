import { MarketingLayout } from 'components/layouts/MarketingLayout'
import type { MarketingTemplateFreeform } from 'features/marketing-layouts/types'
import { MarketingTemplateView } from 'features/marketing-layouts/views'
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
      foreground: ['#ecb6df', '#f6f1ff', '#afd7db'],
    },
    hero: {
      protocol: [LendingProtocol.AaveV2, LendingProtocol.AaveV3],
      title: 'AAVE, with superpowers',
      description:
        "Earn interest, Borrow Assets and Multiply Exposure with DeFi's leading liquidity protocol. Made even better with Summer.fi's Superpowers of one click actions, advanced automations and unified frontend gateway to the best of DeFi.",
      link: { label: 'Open a position', url: '/' },
      image: staticFilesRuntimeUrl('/static/img/marketing-layout/temp-hero.png'),
    },
    blocks: [],
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...marketingTemplatePageProps,
    },
  }
}
