import { getDiscoveryData } from 'features/discovery/api'
import { DiscoveryFilters } from 'features/discovery/common/DiscoveryFilters'
import { DiscoveryTable } from 'features/discovery/common/DiscoveryTable'
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
  const discoveryData = getDiscoveryData(endpoint, settings)

  useEffect(() => {
    setIsLoading(false)
  }, [discoveryData])

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
      <DiscoveryTable
        banner={banner}
        isLoading={isLoading}
        kind={kind}
        rows={discoveryData?.data?.rows}
      />
    </Box>
  )
}
