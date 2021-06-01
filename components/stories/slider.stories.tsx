import { Slider as SliderComponent } from 'components/Slider'
import React from 'react'
import { Box } from 'theme-ui'

export function Slider() {
  return (
    <Box>
      <SliderComponent />
    </Box>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Components',
}
