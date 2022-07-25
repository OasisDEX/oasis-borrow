import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { Item, ItemProps } from './Item'

interface InfoSectionProps {
  title: string
  items: ItemProps[]
}

export function InfoSection({ title, items }: InfoSectionProps) {
  return (
    <Grid
      as="ul"
      sx={{
        p: 3,
        backgroundColor: 'neutral30',
        borderRadius: 'medium',
        listStyle: 'none',
      }}
    >
      <Box as="li" sx={{ listStyle: 'none' }}>
        <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
          {title}
        </Text>
      </Box>
      {items && items.map((item) => <Item {...item} key={item.label} />)}
    </Grid>
  )
}
