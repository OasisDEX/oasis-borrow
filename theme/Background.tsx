import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Box } from 'theme-ui'

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
        backgroundColor: 'white',
        overflow: 'hidden',
        height: wrapper ? 'auto' : `${backgroundSize.height}px`,
        ...(short && { transform: 'scaleY(-1)' }),
        backgroundImage: `url(${staticFilesRuntimeUrl(
          '/static/img/background/background_big_animated.svg',
        )})`,
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {children}
    </Box>
  )
}
