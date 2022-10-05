import { GenericSelect } from 'components/GenericSelect'
import { DiscoveryNavigation } from 'features/discovery/common/DiscoveryNavigation'
import { DiscoveryWrapperWithIntro } from 'features/discovery/common/DiscoveryWrapperWithIntro'
import {
  discoveryPageLayout,
  discoveryPageLayoutProps,
  discoveryPageSeoTags,
} from 'features/discovery/layout'
import { DiscoveryPages } from 'features/discovery/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function DiscoveryPage() {
  const options = [
    { value: '>100k', label: 'Over $100' },
    { value: '75k-100k', label: '$75,000 - $100,000' },
    { value: '50k-75k', label: '$50,000 - $75,000' },
    { value: '<50k', label: 'Below $50,000' },
  ]

  return (
    <DiscoveryWrapperWithIntro>
      <DiscoveryNavigation active={DiscoveryPages.HIGH_RISK_POSITIONS} />
      <GenericSelect options={options} defaultValue={options[0]} />
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
