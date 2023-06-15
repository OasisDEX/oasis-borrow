import backgroundBig from 'public/static/img/background/background_big.svg'
import React, { PropsWithChildren } from 'react'
import { Box } from 'theme-ui'

import { zoomInBackgroundAnimation } from './animations'
import { fadeOut } from './keyframes'

export const backgroundSize = {
  width: 1440,
  height: 845,
}

export function Background({
  children,
  short = false,
  wrapper = false,
}: PropsWithChildren<{ short?: boolean; wrapper?: boolean }>) {
  return (
    <Box
      sx={{
        position: wrapper ? 'static' : 'absolute',
        left: 0,
        top: short ? '-650px' : '0',
        right: 0,
        zIndex: -1,
        backgroundColor: 'white',
        overflow: 'hidden',
        height: wrapper ? 'auto' : `${backgroundSize.height}px`,
        ...(short && { transform: 'scaleY(-1)' }),
        backgroundImage: `url(${backgroundBig})`,
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        ...zoomInBackgroundAnimation,
        '&::after': {
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          content: '""',
          background: 'white',
          opacity: 1,
          animation: fadeOut,
          animationDuration: '0.4s',
          animationDelay: '0.1s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
        },
      }}
    >
      {children}
    </Box>
  )
}
