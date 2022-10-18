import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/Layouts'
import React from 'react'

export const discoverPageLayout = MarketingLayout
export const discoverPageLayoutProps = {
  topBackground: 'lighter',
}
export const discoverPageSeoTags = (
  <PageSEOTags
    title="seo.discover.title"
    description="seo.discover.description"
    url="/discover"
  />
)
