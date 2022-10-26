import { MixpanelUserContext, trackingEvents } from 'analytics/analytics'
import { getDiscoverData } from 'features/discover/api'
import { DiscoverData } from 'features/discover/common/DiscoverData'
import { DiscoverFilters } from 'features/discover/common/DiscoverFilters'
import { getDefaultSettingsState } from 'features/discover/helpers'
import { discoverPagesMeta } from 'features/discover/meta'
import { DiscoverFiltersSettings, DiscoverPages } from 'features/discover/types'
import { keyBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'

interface DiscoverControlProps {
  kind: DiscoverPages
  userContext: MixpanelUserContext
}

export function DiscoverControl({ kind, userContext }: DiscoverControlProps) {
  const { banner, endpoint, filters } = keyBy(discoverPagesMeta, 'kind')[kind]
  const [settings, setSettings] = useState<DiscoverFiltersSettings>(
    getDefaultSettingsState({ filters, kind }),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const response = getDiscoverData(endpoint, settings)

  useEffect(() => {
    if (response) setIsLoading(false)
  }, [response])

  return (
    <Box
      sx={{
        backgroundColor: 'neutral10',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
      }}
    >
      <DiscoverFilters
        filters={filters}
        onChange={(key, currentValue) => {
          trackingEvents.discover.selectedFilter(kind, key, currentValue.label, userContext)
          setIsLoading(true)
          setSettings({
            ...settings,
            [key]: currentValue.value,
          })
        }}
      />
      <DiscoverData
        banner={banner}
        isLoading={isLoading}
        kind={kind}
        response={response}
        userContext={userContext}
      />
    </Box>
  )
}
