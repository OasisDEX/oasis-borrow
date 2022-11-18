import { GenericSelect } from 'components/GenericSelect'
import { DiscoverMultiselect } from 'features/discover/common/DiscoverMultiselect'
import { DiscoverFiltersList, DiscoverFiltersListItem } from 'features/discover/meta'
import { DiscoverFilterType } from 'features/discover/types'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export function DiscoverFilters({
  filters,
  isSmallerScreen,
  isSticky,
  onChange,
}: {
  filters: DiscoverFiltersList
  isSmallerScreen: boolean
  isSticky: boolean
  onChange: (key: string, currentValue: string) => void
}) {
  return (
    <Box
      sx={{
        ...(!isSmallerScreen && {
          position: isSticky ? 'sticky' : 'relative',
          top: 0,
        }),
        p: ['24px', null, null, 4],
        backgroundColor: 'neutral10',
        borderBottom: '1px solid',
        borderBottomColor: 'neutral20',
        borderTopLeftRadius: 'large',
        borderTopRightRadius: 'large',
        zIndex: 2,
      }}
    >
      <Grid
        gap="12px"
        sx={{
          gridTemplateColumns: ['100%', 'repeat(2, 1fr)', null, 'repeat(4, 1fr)'],
        }}
      >
        {Object.keys(filters).map((key) => (
          <DiscoverFilter filter={key} item={filters[key]} key={key} onChange={onChange} />
        ))}
      </Grid>
    </Box>
  )
}

export function DiscoverFilter({
  filter,
  item,
  onChange,
}: {
  filter: string
  item: DiscoverFiltersListItem
  onChange: (key: string, currentValue: string) => void
}) {
  switch (item.type) {
    case DiscoverFilterType.SINGLE:
      return (
        <GenericSelect
          options={item.options}
          defaultValue={item.options[0]}
          onChange={(currentValue) => {
            onChange(filter, currentValue.value)
          }}
        />
      )
    case DiscoverFilterType.MULTI:
      return (
        <DiscoverMultiselect
          {...item}
          onChange={(value) => {
            onChange(filter, value)
          }}
        />
      )
    default:
      return null
  }
}
