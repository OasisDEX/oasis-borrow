import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { Box, Flex, Image } from 'theme-ui'

export function StopLossTxCompleteBanner() {
  return (
    <Box>
      <Flex sx={{ justifyContent: 'center', mb: 4 }}>
        <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
      </Flex>
    </Box>
  )
}
