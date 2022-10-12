import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import React from 'react'

export const discoveryPageLayout = MarketingLayout
export const discoveryPageLayoutProps = {
  topBackground: 'lighter',
}
export const discoveryPageSeoTags = (
  <PageSEOTags
    title="seo.discovery.title"
    description="seo.discovery.description"
    url="/discovery"
  />
)
