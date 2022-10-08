import { DiscoveryFilters } from 'features/discovery/common/DiscoveryFilters'
import { getDefaultSettingsState } from 'features/discovery/helpers'
import { DiscoveryPagesMeta } from 'features/discovery/meta'
import { DiscoveryPages } from 'features/discovery/types'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

export function DiscoveryControl({ active }: { active: DiscoveryPages }) {
  const { filters } = DiscoveryPagesMeta[active]
  const [settings, setSettings] = useState(getDefaultSettingsState({ filters: filters }))

  console.log(settings)

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
