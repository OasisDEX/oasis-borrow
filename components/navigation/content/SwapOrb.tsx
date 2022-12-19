import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { UniswapWidget } from 'components/uniswapWidget/UniswapWidget'
import { useOnboarding } from 'helpers/useOnboarding'
import React from 'react'

export function SwapOrb() {
  const [exchangeOnboarded] = useOnboarding('Exchange')

  return (
    <NavigationOrb icon="exchange" iconSize={20} {...(!exchangeOnboarded && { beacon: true })}>
      {() => <UniswapWidget />}
    </NavigationOrb>
  )
}
