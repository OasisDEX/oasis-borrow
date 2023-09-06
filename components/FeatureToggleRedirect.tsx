import React, { PropsWithChildren } from 'react'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { Feature, useFeatureToggle } from 'helpers/useFeatureToggle'
import { useRouter } from 'next/router'

export type FeatureToggleRedirectProps = {
  feature: Feature
  redirectUrl?: string
}

export function WithFeatureToggleRedirect({
  children,
  feature,
  redirectUrl = INTERNAL_LINKS.homepage,
}: PropsWithChildren<FeatureToggleRedirectProps>) {
  const { replace } = useRouter()
  const featureEnabled = useFeatureToggle(feature)

  if (!featureEnabled) void replace(redirectUrl)

  return featureEnabled ? <>{children}</> : null
}
