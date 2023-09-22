import type { FC } from 'react'
import React from 'react'
import { Box, Flex } from 'theme-ui'

interface StepsProps {
  active?: number
  color?: string
  count: number
}

export const Steps: FC<StepsProps> = ({ active, color, count }) => {
  return (
    <Flex as="ul" sx={{ columnGap: '2px', listStyle: 'none', m: 0, p: 0 }}>
      {[...Array(count)].map((_item, i) => (
        <Box
          key={`${i}${i === active ? '-is-active' : ''}`}
          as="li"
          sx={{
            width: i === active ? '40px' : 2,
            height: 1,
            bg: i === active && color ? color : 'secondary60',
            borderRadius: 'mediumLarge',
            transition: 'width 200ms, background-color 200ms',
          }}
        />
      ))}
    </Flex>
  )
}
