import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { Item, ItemProps } from './Item'

interface InfoSectionProps {
  title: string
  items: ItemProps[]
}

export function InfoSection({ title, items }: InfoSectionProps) {
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  return (
    <Grid
      as="ul"
      sx={{
        p: 0,
        ...(newComponentsEnabled && {
          p: 3,
          backgroundColor: 'secondaryAlt',
          borderRadius: 'medium',
          listStyle: 'none',
        }),
      }}
    >
      <Box as="li" sx={{ listStyle: 'none' }}>
        <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
          {title}
        </Text>
      </Box>
      {items && items.map((item) => <Item {...item} />)}
    </Grid>
  )
}
