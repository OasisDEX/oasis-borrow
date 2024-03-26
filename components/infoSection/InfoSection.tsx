import React from 'react'
import { Box, Grid, Text, type ThemeUIStyleObject } from 'theme-ui'

import type { ItemProps } from './Item'
import { Item } from './Item'

interface InfoSectionProps {
  title?: string
  withListPadding?: boolean
  items: ItemProps[]
  wrapperSx?: ThemeUIStyleObject
  itemWrapperSx?: ThemeUIStyleObject
}

export function InfoSection({
  title,
  items,
  withListPadding = true,
  wrapperSx,
  itemWrapperSx,
}: InfoSectionProps) {
  return (
    <Grid
      as="ul"
      sx={{
        p: withListPadding ? 3 : 0,
        backgroundColor: 'neutral30',
        borderRadius: 'medium',
        listStyle: 'none',
        ...wrapperSx,
      }}
    >
      {title && (
        <Box as="li" sx={{ listStyle: 'none' }}>
          <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
            {title}
          </Text>
        </Box>
      )}
      {items &&
        items.map((item) => <Item {...item} key={item.label} itemWrapperSx={itemWrapperSx} />)}
    </Grid>
  )
}
