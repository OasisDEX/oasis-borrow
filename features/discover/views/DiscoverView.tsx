import { getMixpanelUserContext } from 'analytics/analytics'
import { useAppContext } from 'components/context/AppContextProvider'
import { DiscoverNavigation } from 'features/discover/common/DiscoverNavigation'
import { DiscoverWrapperWithIntro } from 'features/discover/common/DiscoverWrapperWithIntro'
import { DiscoverControl } from 'features/discover/controllers/DiscoverControl'
import { DiscoverPages } from 'features/discover/types'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function DiscoverView({ kind }: { kind: DiscoverPages }) {
  const { i18n } = useTranslation()
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)

  const userContext = getMixpanelUserContext(i18n.language, context)

  return (
    <DiscoverWrapperWithIntro key={kind}>
      <DiscoverNavigation kind={kind} userContext={userContext} />
      <DiscoverControl kind={kind} userContext={userContext} />
    </DiscoverWrapperWithIntro>
  )
}
