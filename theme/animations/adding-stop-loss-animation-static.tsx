import React from 'react'
import Lottie from 'react-lottie-light'
import addingStopLossAnimation from 'theme/animations/lottie/addingStopLossAnimation.json'
import { Box } from 'theme-ui'

const addingStopLossAnimationOptions = {
  loop: true,
  autoplay: true,
  animationData: addingStopLossAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMaxYMid slice',
  },
}

export default function AddingStopLossAnimationStatic() {
  return (
    <Box mb={2}>
      <Lottie options={addingStopLossAnimationOptions} height={180} width={280} />
    </Box>
  )
}
