import { AppLayout } from 'components/layouts/AppLayout'
import { SimpleCarousel } from 'components/SimpleCarousel'
import { IconWithPalette } from 'features/marketing-layouts/components'
import { sleep, stack } from 'features/marketing-layouts/icons'
import type { MarketingLayoutPalette } from 'features/marketing-layouts/types'
import React from 'react'
import { Box, Heading, Text } from 'theme-ui'

function BetterOnSummerPage() {
  const compoundPalette: MarketingLayoutPalette = {
    mainGradient: ['#effff7', '#f9faf9'],
    icon: {
      backgroundGradient: ['#c7e6dd', '#e6f7e6', '#c4edeb'],
      foregroundGradient: ['#a8ddcd', '#efffef', '#ffece2'],
      symbolGradient: ['#0b9f74', '#64dfbb'],
    },
  }
  const sparkPalette: MarketingLayoutPalette = {
    mainGradient: ['#ffeddb', '#fffefc'],
    icon: {
      backgroundGradient: ['#ffdfbe', '#f2e7c0'],
      foregroundGradient: ['#fbd8b2', '#ffffef', '#f3e9c4'],
      symbolGradient: ['#f58013', '#f19d19'],
    },
  }

  return (
    <AppLayout>
      <Box sx={{ width: '100%' }}>
        Test
        <Box>
          <IconWithPalette size={80} contents={sleep} {...compoundPalette.icon} />
        </Box>
        <Box>
          <IconWithPalette size={72} contents={stack} {...sparkPalette.icon} />
        </Box>
        <SimpleCarousel
          header={
            <Box>
              <Heading>Heading</Heading>
              <Text>Lorem ipsum dolor sit amet</Text>
            </Box>
          }
          gap={16}
          slidesToDisplay={2}
          overflow="visible"
          slides={[
            <Box sx={{ bg: 'red', width: '100%' }}>test</Box>,
            <Box sx={{ bg: 'blue', width: '100%' }}>test</Box>,
            <Box sx={{ bg: 'pink', width: '100%' }}>test</Box>,
            <Box sx={{ bg: 'green', width: '100%' }}>test</Box>,
            <Box sx={{ bg: 'yellow', width: '100%' }}>test</Box>,
          ]}
        />
      </Box>
    </AppLayout>
  )
}

export default BetterOnSummerPage
