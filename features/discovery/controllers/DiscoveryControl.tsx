import { DiscoveryFilters } from 'features/discovery/common/DiscoveryFilters'
import { DiscoveryTable } from 'features/discovery/common/DiscoveryTable'
import { getDiscoveryData } from 'features/discovery/discoveryApi'
import { getDefaultSettingsState } from 'features/discovery/helpers'
import { discoveryPagesMeta } from 'features/discovery/meta'
import { DiscoveryFiltersSettings, DiscoveryPages } from 'features/discovery/types'
import { keyBy } from 'lodash'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

interface DiscoveryControlProps {
  active: DiscoveryPages
}

export function DiscoveryControl({ active }: DiscoveryControlProps) {
  const { endpoint, filters } = keyBy(discoveryPagesMeta, 'kind')[active]
  const [settings, setSettings] = useState<DiscoveryFiltersSettings>(
    getDefaultSettingsState({ filters }),
  )
  const discoveryData = getDiscoveryData(endpoint, settings)

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
          setSettings({
            ...settings,
            [key]: currentValue.value,
          })
        }}
      />
      {discoveryData?.data?.rows && <DiscoveryTable rows={discoveryData.data.rows} />}
    </Box>
  )
}
