import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box, Flex } from 'theme-ui'
import { ExchangeButton } from '../ExchangeButton'

import { UniswapWidget } from '../UniswapWidget'

function StoryLayout({ children } : WithChildren) {
  return <Box sx={{ p: 5, bg: 'pink' }}>{children}</Box>
}

export const Widget = () => {
  return <StoryLayout>
    <UniswapWidget provider='asdf' />
  </StoryLayout>
}

export const Menu = () => {
  return <StoryLayout>
    <Flex sx={{ justifyContent: 'center' }}>
      <ExchangeButton />
    </Flex>
  </StoryLayout>
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'UniswapWidget',
}
