import detectEthereumProvider from '@metamask/detect-provider'
import { WithChildren } from 'helpers/types'
import React, { useEffect, useState } from 'react'
import { Box, Flex } from 'theme-ui'

import { ExchangeButton } from '../ExchangeButton'
import { UniswapWidget } from '../UniswapWidget'

function StoryLayout({ children }: WithChildren) {
  return <Box sx={{ p: 5, bg: 'pink' }}>{children}</Box>
}

function useWeb3Provider() {
  const [provider, setProvider]: any = useState()

  useEffect(() => {
    detectEthereumProvider()
      .then(setProvider)
      .catch(() => {
        console.error('Error detecting provider')
      })
  }, [])

  return provider
}

export const Widget = () => {
  const provider = useWeb3Provider()
  return (
    <StoryLayout>
      <UniswapWidget web3Provider={provider} />
    </StoryLayout>
  )
}

export const Menu = () => {
  const provider = useWeb3Provider()
  return (
    <StoryLayout>
      <Flex sx={{ justifyContent: 'center' }}>
        <ExchangeButton web3Provider={provider} />
      </Flex>
    </StoryLayout>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'UniswapWidget',
}
