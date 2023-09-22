import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'

export const DiscoverPageLayout = ({ children }: WithChildren) => <AppLayout>{children}</AppLayout>
export const discoverPageLayoutProps = {
  topBackground: 'lighter',
}
export const discoverPageSeoTags = (
  <PageSEOTags
    title="seo.discover.title"
    description="seo.discover.description"
    url={INTERNAL_LINKS.discover}
  />
)
