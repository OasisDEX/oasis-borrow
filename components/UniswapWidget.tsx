import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

// temporarily use detect provider
import detectEthereumProvider from '@metamask/detect-provider'

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
  return <div>Widget:{provider ? <SwapWidget provider={provider} /> : <div>Detecting provider</div>}</div>
}