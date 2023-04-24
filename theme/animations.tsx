import React from 'react'
import Lottie from 'react-lottie'
import { Box, SxStyleProp } from 'theme-ui'
import addingStopLossAnimation from 'theme/lottie/addingStopLossAnimation.json'
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

const openVaultAnimationOptions = {
  loop: true,
  autoplay: true,
  animationData: openVaultAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

const addingStopLossAnimationOptions = {
  loop: true,
  autoplay: true,
  animationData: addingStopLossAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMaxYMid slice',
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
      <Lottie options={openVaultAnimationOptions} height={160} width={160} />
    </Box>
  )
}

export function AddingStopLossAnimation() {
  return (
    <Box mb={2}>
      <Lottie options={addingStopLossAnimationOptions} height={180} width={280} />
    </Box>
  )
}
