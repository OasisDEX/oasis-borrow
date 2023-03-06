import { useAppContext } from 'components/AppContextProvider'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  SwapWidgetState,
} from 'features/uniswapWidget/SwapWidgetChange'
import { useObservable } from 'helpers/observableHook'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import React, { useEffect } from 'react'
import { Box, SxStyleProp } from 'theme-ui'

import { UniswapWidgetNoSsr } from './UniswapWidgetNoSsr'

export function UniswapWidgetShowHide(props: { sxWrapper?: SxStyleProp }) {
  const { uiChanges } = useAppContext()

  const clickawayRef = useOutsideElementClickHandler(() =>
    uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, { type: 'close' }),
  )

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
  }, [swapWidgetChange])

  if (swapWidgetChange && swapWidgetChange.isOpen) {
    return (
      <Box
        ref={clickawayRef}
        sx={{
          p: 0,
          position: 'absolute',
          top: 'auto',
          left: 'auto',
          right: '240px',
          bottom: 0,
          width: '420px',
          transform: 'translateY(calc(100% + 10px))',
          bg: 'neutral10',
          boxShadow: 'elevation',
          borderRadius: 'mediumLarge',
          border: 'none',
          overflowX: 'visible',
          zIndex: 0,
          minWidth: 7,
          minHeight: 7,
          ...props.sxWrapper,
        }}
      >
        <UniswapWidgetNoSsr token={swapWidgetChange.token} />
      </Box>
    )
  }

  return <></>
}
