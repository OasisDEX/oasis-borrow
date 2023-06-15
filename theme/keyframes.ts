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

export const zoomInBackground = keyframes({
  from: {
    backgroundPosition: 'center top',
  },
  to: {
    backgroundPosition: 'center bottom',
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

export const fadeOut = keyframes({
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0,
  },
})
