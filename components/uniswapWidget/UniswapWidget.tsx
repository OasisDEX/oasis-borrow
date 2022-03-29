import { useAppContext } from 'components/AppContextProvider'
import { AppSpinner } from 'helpers/AppSpinner'
import { useObservable } from 'helpers/observableHook'
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { theme } from 'theme'
import { Box, Flex } from 'theme-ui'

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

const cssPaths = (() => {
  const main = 'div > div:nth-of-type(2) > div:nth-of-type(2)'
  const tokenSel = 'div > div:nth-of-type(1)'

  return {
    main: {
      swapBtn: `${main} > div:nth-of-type(2) > div > button`,
      token1Btn: `${main} > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > button`,
      token2Btn: `${main} > div:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > button`,
      input1: `${main} > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div > input`,
      input2: `${main} > div:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > div > input`,
      confirmBtn: `${main} > div:nth-of-type(3) > div > div:nth-of-type(4) > button`,
    }, 
    // token select
    tokenSel: {
      // this is used by the widget to expand the hover effect through the scrollbar
      hoverAppended: `${tokenSel} > div > div:nth-of-type(3) > div:nth-of-type(1)`,
      option: `${tokenSel} > div > div:nth-of-type(3) > div:nth-of-type(2) > div > div > button`,
    }
  }
})()

export function UniswapWidget() {
  const [SwapWidget, setSwapWidget] = useState()

  const web3Provider = (() => {
    const { web3ContextConnected$ } = useAppContext()
    const [web3Context] = useObservable(web3ContextConnected$)
    return web3Context?.status !== 'connectedReadonly' ? web3Context?.web3.currentProvider : null
  })()

  useEffect(() => {
    setSwapWidget(
      // @ts-ignore
      dynamic(() => import('@uniswap/widgets').then((module) => module.SwapWidget), {
        ssr: false,
      }),
    )
  }, [])

  const { main, tokenSel } = cssPaths

  return web3Provider && SwapWidget ? (
    <Box
      sx={{
        [main.swapBtn]: {
          border: '3px solid',
          borderColor: 'border',
          ':hover': { borderColor: 'primary', bg: 'surface' },
        },
        [main.token1Btn + '[color="interactive"], ' + main.token2Btn + '[color="interactive"]']: {
          border: '1px solid',
          borderColor: 'border',
          ':hover': { borderColor: 'primary', bg: 'surface' },
        },
        [tokenSel.hoverAppended]: { display: 'none' },
        [tokenSel.option]: { bg: 'transparent', ':hover': { bg: 'border' }, borderRadius: '8px' },
      }}
      css={`
        ${main.token1Btn} > div > div, ${main.token2Btn} > div > div {
          font-size: 18px !important;
        }

        ${main.confirmBtn} {
          border-radius: 32px !important;
        }
      `}
    >
      {/* @ts-ignore */}
      <SwapWidget
        provider={web3Provider}
        theme={widgetTheme}
        tokenList={tokenList.tokens}
        convenienceFee={20}
        convenienceFeeRecipient="0xC7b548AD9Cf38721810246C079b2d8083aba8909"
      />
    </Box>
  ) : (
    <Flex sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <AppSpinner />
    </Flex>
  )
}
