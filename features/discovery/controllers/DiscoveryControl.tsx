import { DiscoveryFilters } from 'features/discovery/common/DiscoveryFilters'
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

  // TODO: pass data to table component
  console.log(discoveryData)

  return (
    <Box
      sx={{
        backgroundColor: 'neutral10',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
      }}
    >
      <Box sx={{ p: 4 }}>
        <DiscoveryFilters
          filters={filters}
          onChange={(key, currentValue) => {
            setSettings({
              ...settings,
              [key]: currentValue.value,
            })
          }}
        />
      </Box>
    </Box>
  )
}
