import Image from 'next/image'
import React from 'react'
import { Box } from 'theme-ui'

import { staticFilesRuntimeUrl } from '../helpers/staticPaths'

export function ProductBackground() {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 'calc((100% - 1617px) / 2)',
        top: 0,
        right: 0,
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <Image
          src={staticFilesRuntimeUrl('/static/img/background/top_bg.png')}
          height="469"
          width="1617px"
          layout="responsive"
        />
      </Box>
    </Box>
  )
}
