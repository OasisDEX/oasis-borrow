import React from 'react';
import { theme } from 'theme';
import { Box, Grid, Text } from 'theme-ui';
import { Item, ItemProps } from './Item';

interface InfoSectionProps {
  title: string;
  items: ItemProps[]
}

export function InfoSection({
  title,
  items
}: InfoSectionProps) {
  return (
    <Box>
      <Text
        sx={{
          fontWeight: theme.fontWeights.semiBold,
          fontSize: theme.fontSizes[2]
        }}
      >
        {title}
      </Text>
      <Grid as="ul" gap={3} sx={{ m: 0, p: 0, listStyle: 'none', mt: 3 }}>
        {items && items.map(item => (
          <Item
            {...item}
          />
        ))}
      </Grid>
    </Box>
  )
}