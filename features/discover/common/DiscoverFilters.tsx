import { GenericSelect } from 'components/GenericSelect'
import { DiscoverMultiselect } from 'features/discover/common/DiscoverMultiselect'
import { DiscoverFiltersList } from 'features/discover/meta'
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
          gridTemplateColumns: ['100%', 'repeat(2, 1fr)', null, 'repeat(4, 234px)'],
        }}
      >
        {Object.keys(filters).map((key) => (
          <>
            {filters[key].multi ? (
              <DiscoverMultiselect
                key={key}
                {...filters[key]}
                onChange={(value) => {
                  onChange(key, value)
                }}
              />
            ) : (
              <GenericSelect
                key={key}
                options={filters[key].options}
                defaultValue={filters[key].options[0]}
                onChange={(currentValue) => {
                  onChange(key, currentValue.value)
                }}
              />
            )}
          </>
        ))}
      </Grid>
    </Box>
  )
}
