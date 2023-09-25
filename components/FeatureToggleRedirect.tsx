import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAppConfig } from 'helpers/config'
import { useRouter } from 'next/router'
import type { PropsWithChildren } from 'react'
import React from 'react'
import type { FeaturesEnum } from 'types/config'

export type FeatureToggleRedirectProps = {
  feature: FeaturesEnum
  redirectUrl?: string
}

export function WithFeatureToggleRedirect({
  children,
  feature,
  redirectUrl = INTERNAL_LINKS.homepage,
}: PropsWithChildren<FeatureToggleRedirectProps>) {
  const { replace } = useRouter()
  const features = useAppConfig('features')
  const featureEnabled = features[feature]

  if (!featureEnabled) void replace(redirectUrl)

  return featureEnabled ? <>{children}</> : null
}
