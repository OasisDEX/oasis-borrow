import React from 'react'
import Lottie from 'react-lottie'
import { Box, SxStyleProp } from 'theme-ui'
import openVaultAnimation from 'theme/lottie/openVaultAnimation.json'

import { fadeIn, slideIn } from './keyframes'

export const slideInAnimation = {
  opacity: 0,
  animation: slideIn,
  animationDuration: '0.4s',
  animationTimingFunction: 'ease-out',
  animationFillMode: 'forwards',
  animationDelay: '0.4s',
}

export const fadeInAnimation = {
  opacity: 0,
  animation: fadeIn,
  animationDuration: '0.4s',
  animationTimingFunction: 'ease-out',
  animationFillMode: 'forwards',
}

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: openVaultAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

export function fadeInAnimationDelay(delaySeconds: number): SxStyleProp {
  return {
    ...fadeInAnimation,
    animationDelay: `${delaySeconds}s`,
  }
}

export function OpenVaultAnimation() {
  return (
    <Box mb={2}>
      <Lottie options={defaultOptions} height={160} width={160} />
    </Box>
  )
}
