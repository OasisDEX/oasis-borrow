import * as React from 'react'
import { Box, Slider as ThemeSlider } from 'theme-ui'

interface Props {}

export function Slider({}: Props) {
  return (
    <Box>
      <ThemeSlider />
    </Box>
  )
}
