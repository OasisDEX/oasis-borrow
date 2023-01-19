import { MixpanelUserContext, trackingEvents } from 'analytics/analytics'
import { getDiscoverData } from 'features/discover/api'
import { DiscoverData } from 'features/discover/common/DiscoverData'
import { DiscoverFilters } from 'features/discover/common/DiscoverFilters'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import { getDefaultSettingsState } from 'features/discover/helpers'
import { discoverPagesMeta } from 'features/discover/meta'
import { DiscoverFiltersSettings, DiscoverPages } from 'features/discover/types'
import { keyBy } from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { theme } from 'theme'
import { Box } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface DiscoverControlProps {
  kind: DiscoverPages
  userContext: MixpanelUserContext
}

export function DiscoverControl({ kind, userContext }: DiscoverControlProps) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)
  const anchor = useRef<HTMLDivElement>(null)
  const { banner, endpoint, filters } = keyBy(discoverPagesMeta, 'kind')[kind]
  const [settings, setSettings] = useState<DiscoverFiltersSettings>(
    getDefaultSettingsState({ filters, kind }),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const response = getDiscoverData(endpoint, settings)
  const isSticky = (response && response?.rows?.length > 2) || false

  const onChangeHandler = useCallback(
    (key, currentValue) => {
      if (!isSmallerScreen) {
        const currentPosition = document.querySelector('body')?.scrollTop || 0
        const destinatedPosition = anchor.current ? anchor.current.offsetTop + 1 : 0

        if (currentPosition > destinatedPosition) {
          document.querySelector('body')?.scrollTo({ top: destinatedPosition, behavior: 'smooth' })
        }
      }
      trackingEvents.discover.selectedFilter(kind, key, currentValue, userContext)
      setIsLoading(true)
      setSettings({
        ...settings,
        [key]: currentValue,
      })
    },
    [settings],
  )

  useEffect(() => {
    if (response) setIsLoading(false)
  }, [response])

  return (
    <DiscoverTableContainer>
      <Box ref={anchor} />
      <DiscoverFilters
        filters={filters}
        isSmallerScreen={isSmallerScreen}
        isSticky={isSticky}
        onChange={onChangeHandler}
      />
      <DiscoverData
        banner={banner}
        isLoading={isLoading}
        isSticky={isSticky}
        kind={kind}
        response={response}
        userContext={userContext}
      />
    </DiscoverTableContainer>
  )
}
