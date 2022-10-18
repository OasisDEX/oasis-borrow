import { GenericSelect } from 'components/GenericSelect'
import { DiscoverFiltersList, DiscoverFiltersListItem } from 'features/discover/meta'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export function DiscoverFilters({
  filters,
  onChange,
}: {
  filters: DiscoverFiltersList
  onChange: (key: string, currentValue: DiscoverFiltersListItem) => void
}) {
  return (
    <Box sx={{ p: ['24px', null, null, 4] }}>
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
