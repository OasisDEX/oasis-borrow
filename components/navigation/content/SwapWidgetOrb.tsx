import { useAppContext } from 'components/AppContextProvider'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { SwapWidgetShowHide } from 'components/swapWidget/SwapWidgetShowHide'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
} from 'features/swapWidget/SwapWidgetChange'
import { useOnboarding } from 'helpers/useOnboarding'
import React, { useState } from 'react'
import { Box } from 'theme-ui'

export function SwapWidgetOrb() {
  const { uiChanges } = useAppContext()
  const [exchangeOnboarded] = useOnboarding('SwapWidget')
  const [exchangeOpened, setExchangeOpened] = useState(false)

  return (
    <Box>
      <NavigationOrb
        beacon={!exchangeOnboarded && !exchangeOpened}
        icon="exchange"
        iconSize={18}
        onClick={() => {
          setExchangeOpened(true)
          uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
            type: 'open',
          })
        }}
      />
      <SwapWidgetShowHide />
    </Box>
  )
}
