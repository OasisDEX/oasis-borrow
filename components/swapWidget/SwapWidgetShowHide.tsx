import { useConnectWallet } from '@web3-onboard/react'
import { DrawerMenu } from 'components/DrawerMenu'
import type { SwapWidgetChangeAction, SwapWidgetState } from 'features/swapWidget/SwapWidgetChange'
import { SWAP_WIDGET_CHANGE_SUBJECT } from 'features/swapWidget/SwapWidgetChange'
import { useObservable } from 'helpers/observableHook'
import { uiChanges } from 'helpers/uiChanges'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useCallback, useEffect, useState } from 'react'
import { Box } from 'theme-ui'

import { swapWidgetConfig } from './swapWidgetConfig'
import { SwapWidgetNoSsr } from './SwapWidgetNoSsr'

export function SwapWidgetShowHide() {
  const [wallet] = useConnectWallet()
  const [onceLoaded, setOnceLoaded] = useState(false)

  const [swapWidgetChange] = useObservable(
    uiChanges.subscribe<SwapWidgetState>(SWAP_WIDGET_CHANGE_SUBJECT),
  )

  const swapWidgetClose = useCallback(() => {
    swapWidgetChange?.isOpen &&
      uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, { type: 'close' })
  }, [swapWidgetChange?.isOpen, uiChanges])

  const clickawayRef = useOutsideElementClickHandler(swapWidgetClose)

  useEffect(() => {
    if (swapWidgetChange?.isOpen && clickawayRef?.current) {
      const clientRect = clickawayRef.current.getBoundingClientRect()
      if (clientRect.bottom > window.innerHeight || clientRect.top < 0) {
        clickawayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [clickawayRef, swapWidgetChange])

  useEffect(() => {
    if (!wallet) {
      swapWidgetClose()
      setOnceLoaded(false)
    }
  }, [wallet, swapWidgetClose])

  // Initialize SwapWidgetNoSsr component only when drawer menu was opened for the first time
  // to avoid unnecessary rpc calls. Once initialized SwapWidgetNoSsr will be rendered even if
  // drawer will be closed to maintain its state.
  useEffect(() => {
    if (swapWidgetChange?.isOpen && !onceLoaded) {
      setOnceLoaded(true)
    }
  }, [swapWidgetChange?.isOpen, onceLoaded])

  return (
    <Box ref={clickawayRef}>
      <DrawerMenu
        position="right"
        isOpen={swapWidgetChange ? swapWidgetChange.isOpen : false}
        onClose={swapWidgetClose}
        overlay
        sxOverride={{
          backgroundColor: swapWidgetConfig.theme?.palette?.background?.default,
          minWidth: ['100%', '430px'],
          p: 0,
        }}
      >
        {onceLoaded && <SwapWidgetNoSsr />}
      </DrawerMenu>
    </Box>
  )
}
