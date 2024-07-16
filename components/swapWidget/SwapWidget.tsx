import { useMainContext } from 'components/context/MainContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useOnboarding } from 'helpers/useOnboarding'
import React from 'react'
import { Box } from 'theme-ui'

import { SwapWidgetOnboarding } from './SwapWidgetOnboarding'
import { SwapWidgetSkeleton } from './SwapWidgetSkeleton'

export function SwapWidget() {
  const { web3ContextConnected$ } = useMainContext()
  const [web3Context] = useObservable(web3ContextConnected$)
  const [isOnboarded] = useOnboarding('SwapWidget')

  const web3Provider =
    web3Context?.status !== 'connectedReadonly' ? web3Context?.web3.currentProvider : null

  if (!web3Provider) {
    return <SwapWidgetSkeleton />
  }

  return (
    <Box
      sx={{
        height: '100%',
        '& > div': {
          maxHeight: '100%',
          height: '100%',
        },
      }}
    >
      {!isOnboarded ? <SwapWidgetOnboarding /> : <div>Temporarily disabled.</div>}
    </Box>
  )
}
