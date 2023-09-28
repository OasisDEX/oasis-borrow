import dynamic from 'next/dynamic'
import type { ThemeUIStyleObject } from 'theme-ui'

import { fadeIn, rollDownTopBanner, rollDownTopBannerMobile, slideIn } from './keyframes'

export const slideInAnimation = {
  opacity: 0,
  animation: `${slideIn} 0.4s ease-out forwards 0.4s`,
}

export const fadeInAnimation = {
  opacity: 0,
  animation: `${fadeIn} 0.4s ease-out forwards 0.4s`,
}

export const rollDownTopBannerAnimation = {
  animation: [
    `${rollDownTopBannerMobile} 0.4s ease-out forwards 3s`,
    `${rollDownTopBanner} 0.4s ease-out forwards 3s`,
  ],
  maxHeight: [0, 'initial'],
}

export const fadeInAnimationMobile = {
  opacity: [0, 1],
  animation: [`${fadeIn} 0.4s ease-out forwards`, 'none'],
}

export function fadeInAnimationDelay(delaySeconds: number): ThemeUIStyleObject {
  return {
    ...fadeInAnimation,
    animationDelay: `${delaySeconds}s`,
  }
}

export { fadeIn, rollDownTopBanner, rollDownTopBannerMobile, slideIn }

export const AddingStopLossAnimation = dynamic(
  () => {
    return import('./adding-stop-loss-animation-static')
  },
  {
    ssr: false,
  },
)

export const OpenVaultAnimation = dynamic(
  () => {
    return import('./open-vault-animation-static')
  },
  {
    ssr: false,
  },
)
