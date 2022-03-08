import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { theme } from 'theme'
// temporarily use detect provider
import detectEthereumProvider from '@metamask/detect-provider'

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

export function UniswapWidget({ }: { provider: any}) {
  // @ts-ignore
  const SwapWidget = dynamic(() => import('@uniswap/widgets').then((module) => module.SwapWidget), { ssr: false })

  const [provider, setProvider] = useState()  

  useEffect(() => {

    (async () => {
      setProvider((await detectEthereumProvider()) as any)
    })()
    
  }, [])

  // @ts-ignore
  return provider ? <SwapWidget provider={provider} theme={widgetTheme} /> : <div>Detecting provider</div>
}