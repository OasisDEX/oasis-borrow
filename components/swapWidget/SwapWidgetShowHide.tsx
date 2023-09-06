import React, { useCallback, useEffect } from 'react'
import { useConnectWallet } from '@web3-onboard/react'
import { DrawerMenu } from 'components/DrawerMenu'
import { swapWidgetConfig } from 'components/swapWidget/swapWidgetConfig'
import { SwapWidgetNoSsr } from 'components/swapWidget/SwapWidgetNoSsr'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  SwapWidgetState,
} from 'features/swapWidget/SwapWidgetChange'
import { useObservable } from 'helpers/observableHook'
import { uiChanges } from 'helpers/uiChanges'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { Box } from 'theme-ui'

export function SwapWidgetShowHide() {
  const [wallet] = useConnectWallet()

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
    }
  }, [wallet, swapWidgetClose])

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
        <SwapWidgetNoSsr />
      </DrawerMenu>
    </Box>
  )
}
