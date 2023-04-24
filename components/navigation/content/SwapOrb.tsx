import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { UniswapWidgetNoSsr } from 'components/uniswapWidget/UniswapWidgetNoSsr'
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
      {() => <UniswapWidgetNoSsr />}
    </NavigationOrb>
  )
}
