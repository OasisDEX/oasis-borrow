import { AppSpinner } from 'helpers/AppSpinner'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { theme } from 'theme'
import { Box, Flex } from 'theme-ui'
import { provider } from 'web3-core'

const { colors, radii } = theme

const widgetTheme = {
  accent: colors.primary,
  primary: colors.primary,
  container: colors.background,
  active: colors.primary,
  interactive: colors.surface,
  module: '#F6F6F6',
  dialog: colors.background,
  success: colors.success,
  error: colors.error,
  tokenColorExtraction: false,
  borderRadius: radii.mediumLarge,
}

const cssPaths = {
  swapBtn: 'div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > button',
  token1Btn:
    'div > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > button',
  token2Btn:
    'div > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > button',
}

export function UniswapWidget({ web3Provider }: { web3Provider?: provider }) {
  const [SwapWidget, setSwapWidget] = useState()

  useEffect(() => {
    setSwapWidget(
      // @ts-ignore
      dynamic(() => import('@uniswap/widgets').then((module) => module.SwapWidget), {
        ssr: false,
      }),
    )
  }, [])

  const { swapBtn, token1Btn, token2Btn } = cssPaths

  return web3Provider && SwapWidget ? (
    <Box
      sx={{
        [swapBtn]: { border: '3px solid', borderColor: 'primary' },
        [token1Btn + ', ' + token2Btn]: { border: '1px solid', borderColor: 'primary' },
      }}
    >
      {/* @ts-ignore */}
      <SwapWidget provider={web3Provider} theme={widgetTheme} />
    </Box>
  ) : (
    <Flex sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <AppSpinner />
    </Flex>
  )
}
