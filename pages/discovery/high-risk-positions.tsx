import { DiscoveryNavigation } from 'features/discovery/common/DiscoveryNavigation'
import { DiscoveryWrapperWithIntro } from 'features/discovery/common/DiscoveryWrapperWithIntro'
import { DiscoveryControl } from 'features/discovery/controllers/DiscoveryControl'
import {
  discoveryPageLayout,
  discoveryPageLayoutProps,
  discoveryPageSeoTags,
} from 'features/discovery/layout'
import { DiscoveryPages } from 'features/discovery/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function DiscoveryPage() {
  return (
    <DiscoveryWrapperWithIntro>
      <DiscoveryNavigation active={DiscoveryPages.HIGH_RISK_POSITIONS} />
      <DiscoveryControl active={DiscoveryPages.HIGH_RISK_POSITIONS} />
    </DiscoveryWrapperWithIntro>
  )
}

DiscoveryPage.layout = discoveryPageLayout
DiscoveryPage.layoutProps = discoveryPageLayoutProps
DiscoveryPage.seoTags = discoveryPageSeoTags

export default DiscoveryPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
