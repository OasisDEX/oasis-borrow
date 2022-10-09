import { DiscoveryFilters } from 'features/discovery/common/DiscoveryFilters'
import { DiscoveryTable } from 'features/discovery/common/DiscoveryTable'
import { getDiscoveryData } from 'features/discovery/discoveryApi'
import { getDefaultSettingsState } from 'features/discovery/helpers'
import { discoveryPagesMeta } from 'features/discovery/meta'
import { DiscoveryFiltersSettings, DiscoveryPages } from 'features/discovery/types'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

export function DiscoveryControl({ active }: { active: DiscoveryPages }) {
  const { endpoint, filters } = discoveryPagesMeta[active]
  const [settings, setSettings] = useState<DiscoveryFiltersSettings>(
    getDefaultSettingsState({ filters: filters }),
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
      <Box sx={{ py: 2, px: 4, borderTop: '1px solid', borderTopColor: 'neutral20' }}>
        {discoveryData?.data?.rows && <DiscoveryTable rows={discoveryData.data.rows} />}
      </Box>
    </Box>
  )
}
