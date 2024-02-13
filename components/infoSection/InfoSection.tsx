import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import type { ItemProps } from './Item'
import { Item } from './Item'

interface InfoSectionProps {
  title?: string
  withListPadding?: boolean
  items: ItemProps[]
}

export function InfoSection({ title, items, withListPadding = true }: InfoSectionProps) {
  return (
    <Grid
      as="ul"
      sx={{
        p: withListPadding ? 3 : 0,
        backgroundColor: 'neutral30',
        borderRadius: 'medium',
        listStyle: 'none',
      }}
    >
      {title && (
        <Box as="li" sx={{ listStyle: 'none' }}>
          <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
            {title}
          </Text>
        </Box>
      )}
      {items && items.map((item) => <Item {...item} key={item.label} />)}
    </Grid>
  )
}
