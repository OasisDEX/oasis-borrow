import { PageSEOTags } from 'components/HeadTags'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'

export const discoverPageSeoTags = (
  <PageSEOTags
    title="seo.discover.title"
    description="seo.discover.description"
    url={INTERNAL_LINKS.discover}
  />
)
