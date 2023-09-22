import dynamic from 'next/dynamic'
import type { SxStyleProp } from 'theme-ui'

import { fadeIn, rollDownTopBanner, rollDownTopBannerMobile, slideIn } from './keyframes'

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

export const rollDownTopBannerAnimation = {
  animation: [rollDownTopBannerMobile, rollDownTopBanner],
  animationDuration: ['0.4s', '0.4s'],
  animationTimingFunction: ['ease-out', 'ease-out'],
  animationFillMode: ['forwards', 'forwards'],
  animationDelay: ['3s', '3s'],
  maxHeight: [0, 'initial'],
}

export const fadeInAnimationMobile = {
  opacity: [0, 1],
  animation: [fadeIn, 'none'],
  animationDuration: '0.4s',
  animationTimingFunction: 'ease-out',
  animationFillMode: 'forwards',
}

export function fadeInAnimationDelay(delaySeconds: number): SxStyleProp {
  return {
    ...fadeInAnimation,
    animationDelay: `${delaySeconds}s`,
  }
}

export { fadeIn, rollDownTopBanner, rollDownTopBannerMobile, slideIn }

export const AddingStopLossAnimation = dynamic(
  () => {
    return import('./adding-stop-loss-animation-static').then((component) => component.default)
  },
  {
    ssr: false,
  },
)

export const OpenVaultAnimation = dynamic(
  () => {
    return import('./open-vault-animation-static').then((component) => component.default)
  },
  {
    ssr: false,
  },
)
