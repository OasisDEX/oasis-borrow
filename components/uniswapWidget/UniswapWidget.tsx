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

const wrapperPath = 'div > div:nth-of-type(2) > div:nth-of-type(2)'

const cssPaths = {
  // main screen
  swapBtn: `${wrapperPath} > div:nth-of-type(2) > div > button`,
  token1Btn: `${wrapperPath} > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > button`,
  token2Btn: `${wrapperPath} > div:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > button`,
  input1: `${wrapperPath} > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div > input`,
  input2: `${wrapperPath} > div:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > div > input`,
  confirmBtn: `${wrapperPath} > div:nth-of-type(3) > div > div:nth-of-type(4) > button`,

  // token selection
  // this is used by the widget to expand the hover effect through the scrollbar
  hoverAppended: `div > div:nth-of-type(1) > div > div:nth-of-type(3) > div:nth-of-type(1)`,
  tokenOption: `div > div:nth-of-type(1) > div > div:nth-of-type(3) > div:nth-of-type(2) > div > div > button`,
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

  const { swapBtn, token1Btn, token2Btn, confirmBtn, hoverAppended, tokenOption } = cssPaths

  return web3Provider && SwapWidget ? (
    <Box
      sx={{
        [swapBtn]: {
          border: '3px solid',
          borderColor: 'border',
          ':hover': { borderColor: 'primary', bg: 'surface' },
        },
        [token1Btn + '[color="interactive"], ' + token2Btn + '[color="interactive"]']: {
          border: '1px solid',
          borderColor: 'border',
          ':hover': { borderColor: 'primary', bg: 'surface' },
        },
        [hoverAppended]: { display: 'none' },
        [tokenOption]: { bg: 'transparent', ':hover': { bg: 'border' }, borderRadius: '8px' },
      }}
      css={`
        ${token1Btn} > div > div, ${token2Btn} > div > div {
          font-size: 18px !important;
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
