import { AppLayout } from 'components/layouts/AppLayout'
import { IconWithPalette } from 'features/marketing-layouts/components'
import { sleep, stack } from 'features/marketing-layouts/icons'
import React from 'react'
import { Box } from 'theme-ui'

function BetterOnSummerPage() {
  const compoundPalette = {
    backgroundGradient: ['#c7e6dd', '#e6f7e6', '#c4edeb'],
    foregroundGradient: ['#a8ddcd', '#efffef', '#ffece2'],
    symbolGradient: ['#0b9f74', '#64dfbb'],
  }
  const sparkPalette = {
    backgroundGradient: ['#ffdfbe', '#f2e7c0'],
    foregroundGradient: ['#fbd8b2', '#ffffef', '#f3e9c4'],
    symbolGradient: ['#f58013', '#f19d19'],
  }

  return (
    <AppLayout>
      <Box>
        Test
        <Box>
          <IconWithPalette size={80} contents={sleep} {...compoundPalette} />
        </Box>
        <Box>
          <IconWithPalette size={72} contents={stack} {...sparkPalette} />
        </Box>
      </Box>
    </AppLayout>
  )
}

export default BetterOnSummerPage
