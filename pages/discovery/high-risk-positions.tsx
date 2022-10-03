import { DiscoveryWrapperWithIntro } from 'features/discovery/common/DiscoveryWrapperWithIntro'
import {
  discoveryPageLayout,
  discoveryPageLayoutProps,
  discoveryPageSeoTags,
} from 'features/discovery/helpers/layout'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function DiscoveryPage() {
  return <DiscoveryWrapperWithIntro>Lorem ipsum</DiscoveryWrapperWithIntro>
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
