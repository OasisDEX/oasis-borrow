import { useAppContext } from 'components/AppContextProvider'
import { DrawerMenu } from 'components/DrawerMenu'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  SwapWidgetState,
} from 'features/swapWidget/SwapWidgetChange'
import { useObservable } from 'helpers/observableHook'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useEffect } from 'react'
import { Box } from 'theme-ui'

import { swapWidgetConfig } from './swapWidgetConfig'
import { SwapWidgetNoSsr } from './SwapWidgetNoSsr'

export function SwapWidgetShowHide() {
  const { uiChanges } = useAppContext()

  const swapWidgetClose = () => {
    uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, { type: 'close' })
  }

  const clickawayRef = useOutsideElementClickHandler(swapWidgetClose)

  const [swapWidgetChange] = useObservable(
    uiChanges.subscribe<SwapWidgetState>(SWAP_WIDGET_CHANGE_SUBJECT),
  )

  useEffect(() => {
    if (swapWidgetChange?.isOpen && clickawayRef?.current) {
      const clientRect = clickawayRef.current.getBoundingClientRect()
      if (clientRect.bottom > window.innerHeight || clientRect.top < 0) {
        clickawayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [clickawayRef, swapWidgetChange])

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
