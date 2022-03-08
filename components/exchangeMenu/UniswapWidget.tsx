import { AppSpinner } from 'helpers/AppSpinner'
import dynamic from 'next/dynamic'
import React from 'react'
import { theme } from 'theme'
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
  borderRadius: radii.mediumLarge
}

export function UniswapWidget({ web3Provider }: { web3Provider?: provider}) {
  // @ts-ignore
  const SwapWidget = dynamic(() => import('@uniswap/widgets').then((module) => module.SwapWidget), { ssr: false })

  // @ts-ignore
  return web3Provider ? <SwapWidget provider={web3Provider} theme={widgetTheme} /> : <AppSpinner />
}