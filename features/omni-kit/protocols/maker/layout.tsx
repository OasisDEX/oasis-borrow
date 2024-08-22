import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PageSEOTags } from 'components/HeadTags'
import type { FC } from 'react'
import React from 'react'
import { FeaturesEnum } from 'types/config'

export const MakerWrapper: FC = ({ children }) => {
  return (
    // TODO add Maker ft
    <WithFeatureToggleRedirect feature={FeaturesEnum.MorphoBlue}>
      {children}
    </WithFeatureToggleRedirect>
  )
}

export const makerPageSeoTags = (
  <PageSEOTags title="seo.maker.title" description="seo.maker.description" />
)
