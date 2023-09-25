import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import type { SwapWidgetChangeAction } from 'features/swapWidget/SwapWidgetChange'
import { SWAP_WIDGET_CHANGE_SUBJECT } from 'features/swapWidget/SwapWidgetChange'
import { uiChanges } from 'helpers/uiChanges'
import { useOnboarding } from 'helpers/useOnboarding'
import React, { useState } from 'react'
import { exchange } from 'theme/icons'

export function SwapWidgetOrb() {
  const [exchangeOnboarded] = useOnboarding('SwapWidget')
  const [exchangeOpened, setExchangeOpened] = useState(false)

  return (
    <NavigationOrb
      beacon={!exchangeOnboarded && !exchangeOpened}
      icon={exchange}
      iconSize={18}
      onClick={() => {
        setExchangeOpened(true)
        uiChanges.publish<SwapWidgetChangeAction>(SWAP_WIDGET_CHANGE_SUBJECT, {
          type: 'open',
        })
      }}
    />
  )
}
