import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PageSEOTags } from 'components/HeadTags'
import type { FC } from 'react'
import React from 'react'
import { FeaturesEnum } from 'types/config'

export const MorphoWrapper: FC = ({ children }) => {
  return (
    <WithFeatureToggleRedirect feature={FeaturesEnum.MorphoBlue}>
      {children}
    </WithFeatureToggleRedirect>
  )
}

export const morphoPageSeoTags = (
  <PageSEOTags title="seo.morpho.title" description="seo.morpho.description" />
)
