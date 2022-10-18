import { getDiscoveryData } from 'features/discovery/api'
import { DiscoveryData } from 'features/discovery/common/DiscoveryData'
import { DiscoveryFilters } from 'features/discovery/common/DiscoveryFilters'
import { getDefaultSettingsState } from 'features/discovery/helpers'
import { discoveryPagesMeta } from 'features/discovery/meta'
import { DiscoveryFiltersSettings, DiscoveryPages } from 'features/discovery/types'
import { keyBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'

interface DiscoveryControlProps {
  kind: DiscoveryPages
}

export function DiscoveryControl({ kind }: DiscoveryControlProps) {
  const { banner, endpoint, filters } = keyBy(discoveryPagesMeta, 'kind')[kind]
  const [settings, setSettings] = useState<DiscoveryFiltersSettings>(
    getDefaultSettingsState({ filters, kind }),
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const response = getDiscoveryData(endpoint, settings)

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
      <DiscoveryFilters
        filters={filters}
        onChange={(key, currentValue) => {
          setIsLoading(true)
          setSettings({
            ...settings,
            [key]: currentValue.value,
          })
        }}
      />
      <DiscoveryData banner={banner} response={response} isLoading={isLoading} kind={kind} />
    </Box>
  )
}
