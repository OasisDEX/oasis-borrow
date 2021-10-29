import { Flex } from '@theme-ui/components'
import { tokens } from 'blockchain/tokensMetadata'
import React from 'react'
import { Box } from 'theme-ui'

import { AssetAbout } from '../AssetView'

export function AllAboutCards() {
  const allCollaterals = tokens
    .filter((token) => token.background !== undefined)
    .filter((token) => !(token.tags as string[]).includes('lp-token'))
    .map((token) => ({
      token,
    }))

  return (
    <Flex sx={{ flexWrap: 'wrap', flex: '' }}>
      {allCollaterals.map(({ token }) => (
        <Box key={token.symbol} sx={{ p: 2, maxWidth: '500px' }}>
          <AssetAbout token={token.symbol} />
        </Box>
      ))}
    </Flex>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Assets/About Cards',
}
