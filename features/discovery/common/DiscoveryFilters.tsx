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
      <Grid
        gap="12px"
        sx={{
          gridTemplateColumns: ['100%', 'repeat(2, 1fr)', null, 'repeat(4, 230px)'],
        }}
      >
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
