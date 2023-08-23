import React from 'react'
import Lottie from 'react-lottie'
import { Box } from 'theme-ui'
import openVaultAnimation from 'theme/animations/lottie/openVaultAnimation.json'

const openVaultAnimationOptions = {
  loop: true,
  autoplay: true,
  animationData: openVaultAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}
export default function OpenVaultAnimationStatic() {
  return (
    <Box mb={2}>
      <Lottie options={openVaultAnimationOptions} height={160} width={160} />
    </Box>
  )
}
