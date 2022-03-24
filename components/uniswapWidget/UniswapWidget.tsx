import { AppSpinner } from 'helpers/AppSpinner'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { theme } from 'theme'
import { Box, Flex } from 'theme-ui'
import { provider } from 'web3-core'

import tokenList from './tokenList.json'

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

const wrapperPath = 'div > div:nth-child(2) > div:nth-child(2)'

const cssPaths = {
  swapBtn: `${wrapperPath} > div:nth-child(2) > div > button`,
  token1Btn:
    `${wrapperPath} > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > button`,
  token2Btn:
    `${wrapperPath} > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > button`,
  input1:
    `${wrapperPath} > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div > input`,
  input2:
    `${wrapperPath} > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > div > input`,
  confirmBtn:
    `${wrapperPath} > div:nth-child(3) > div > div:nth-child(5) > button`
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

  const { swapBtn, token1Btn, token2Btn, input1, input2, confirmBtn } = cssPaths

  return web3Provider && SwapWidget ? (
    <Box
      sx={{
        [swapBtn]: { border: '3px solid', borderColor: 'border', ':hover': { borderColor: 'primary', bg: 'surface' } },
        [token1Btn + '[color="interactive"], ' + token2Btn + '[color="interactive"]']: { border: '1px solid', borderColor: 'border', ':hover': { borderColor: 'primary', bg: 'surface'} },
      }}
      css={`
        ${token1Btn} > div > div, ${token2Btn} > div > div {
          font-size: 18px !important;
        }

        ${input1}, ${input2} {
          font-family: '"FT Polar Trial", "Helvetica Neue", sans-serif' !important;
        }

        ${confirmBtn} {
          border-radius: 32px !important;
        }
      `}
    >
      {/* @ts-ignore */}
      <SwapWidget provider={web3Provider} theme={widgetTheme} tokenList={tokenList.tokens} />
    </Box>
  ) : (
    <Flex sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <AppSpinner />
    </Flex>
  )
}
