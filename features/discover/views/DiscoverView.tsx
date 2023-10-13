import { getMixpanelUserContext } from 'analytics/analytics'
import { useMainContext } from 'components/context/MainContextProvider'
import { DiscoverNavigation } from 'features/discover/common/DiscoverNavigation'
import { DiscoverWrapperWithIntro } from 'features/discover/common/DiscoverWrapperWithIntro'
import { DiscoverControl } from 'features/discover/controllers/DiscoverControl'
import type { DiscoverPages } from 'features/discover/types'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function DiscoverView({ kind }: { kind: DiscoverPages }) {
  const { i18n } = useTranslation()
  const { context$ } = useMainContext()
  const [context] = useObservable(context$)

  const userContext = getMixpanelUserContext(i18n.language, context)

  return (
    <DiscoverWrapperWithIntro key={kind}>
      <DiscoverNavigation kind={kind} userContext={userContext} />
      <DiscoverControl kind={kind} userContext={userContext} />
    </DiscoverWrapperWithIntro>
  )
}
