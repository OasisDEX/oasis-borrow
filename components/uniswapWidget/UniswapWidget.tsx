import { SwapWidget } from '@uniswap/widgets'
import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { theme } from 'theme'
import { Box } from 'theme-ui'

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

function scrollbarBg(hexColor: string) {
  return `radial-gradient( closest-corner at 0.25em 0.25em, ${hexColor} 0.25em, transparent 0.25em ), linear-gradient( to bottom, ${hexColor}00 0.25em, ${hexColor} 0.25em, ${hexColor} calc(100% - 0.25em), ${hexColor}00 calc(100% - 0.25em) ), radial-gradient( closest-corner at 0.25em calc(100% - 0.25em), ${hexColor} 0.25em, ${hexColor}00 0.25em )`
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
    },
    // token select
    tokenSel: {
      // hoverAppended is for expanding the hover effect through the scrollbar (we'll hide it)
      hoverAppended: `${tokenSel} > div > div:nth-of-type(3) > div:nth-of-type(1)`,
      option: `${tokenSel} > div > div:nth-of-type(3) > div:nth-of-type(2) > div > div > button`,
      search: `${tokenSel} input[inputmode=text]`,
      scrollbar: `${tokenSel} .scrollbar`,
    },
  }
})()

export function UniswapWidget() {
  const { web3ContextConnected$ } = useAppContext()
  const [web3Context] = useObservable(web3ContextConnected$)
  const web3Provider =
    web3Context?.status !== 'connectedReadonly' ? web3Context?.web3.currentProvider : null

  const { main, tokenSel } = cssPaths

  if (!web3Provider) {
    return null
  }

  return (
    <Box
      sx={{
        '.subhead': { fontWeight: 'medium' },
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
        [tokenSel.option]: {
          bg: 'transparent',
          ':hover': { bg: 'border' },
          borderRadius: '8px',
          '.subhead': { fontWeight: 'semiBold' },
        },
        [tokenSel.search]: {
          borderColor: 'border',
          borderRadius: 'medium',
          ':hover': { bg: 'surface' },
          ':focus': { borderColor: 'primary' },
          '::placeholder': { color: 'text.lavender' },
        },
        [tokenSel.scrollbar]: {
          '::-webkit-scrollbar-thumb': {
            background: scrollbarBg('#A8A9B1'),
            backgroundClip: 'padding-box',
          },
        },
      }}
      css={`
        ${main.token1Btn} > div > div, ${main.token2Btn} > div > div {
          font-size: 18px !important;
        }

        button[color=accent] {
          border-radius: 32px !important;
        }
      `}
    >
      <SwapWidget
        /* @ts-ignore */
        provider={web3Provider}
        theme={widgetTheme}
        tokenList={tokenList.tokens}
        convenienceFee={20}
        convenienceFeeRecipient="0xC7b548AD9Cf38721810246C079b2d8083aba8909"
      />
    </Box>
  )
}
