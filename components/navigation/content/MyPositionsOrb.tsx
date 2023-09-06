import React from 'react'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { useAccount } from 'helpers/useAccount'

export function MyPositionsOrb() {
  const { amountOfPositions, walletAddress } = useAccount()

  return (
    <NavigationOrb
      icon="home"
      iconSize={16}
      link={`/owner/${walletAddress}`}
      {...(!!amountOfPositions && { beacon: amountOfPositions })}
    />
  )
}
