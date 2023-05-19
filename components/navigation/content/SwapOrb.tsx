import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { SwapWidgetNoSsr } from 'components/swapWidget/SwapWidgetNoSsr'
import { useOnboarding } from 'helpers/useOnboarding'
import React from 'react'

export function SwapOrb() {
  const [exchangeOnboarded] = useOnboarding('Exchange')

  return (
    <NavigationOrb
      icon="exchange"
      iconSize={20}
      width={360}
      {...(!exchangeOnboarded && { beacon: true })}
    >
      {() => <SwapWidgetNoSsr />}
    </NavigationOrb>
  )
}
