import { GenericSelect } from 'components/GenericSelect'
import { DiscoveryFiltersList, DiscoveryFiltersListItem } from 'features/discovery/meta'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export function DiscoveryFilters({
  filters,
  onChange,
}: {
  filters: DiscoveryFiltersList
  onChange: (key: string, currentValue: DiscoveryFiltersListItem) => void
}) {
  return (
    <Box sx={{ p: 4 }}>
      <Grid columns="repeat(4, 205px)" gap="12px">
        {Object.keys(filters).map((key) => (
          <GenericSelect
            key={key}
            options={filters[key]}
            defaultValue={filters[key][0]}
            onChange={(currentValue) => {
              onChange(key, currentValue)
            }}
          />
        ))}
      </Grid>
    </Box>
  )
}
