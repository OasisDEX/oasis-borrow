import { keyframes } from '@emotion/core'

export const slideIn = keyframes({
  from: {
    top: '60px',
    opacity: 0,
  },
  to: {
    top: 0,
    opacity: 1,
  },
})

export const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
})

export const rollDownTopBanner = keyframes({
  from: {
    padding: 0,
    height: 0,
  },
  to: {
    padding: '16px',
    height: '56px',
  },
})

export const rollDownTopBannerMobile = keyframes({
  from: {
    padding: '0 76px',
    maxHeight: 0,
  },
  to: {
    padding: '16px 76px',
    maxHeight: '300px',
  },
})

export const fadeOut = keyframes({
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0,
  },
})
