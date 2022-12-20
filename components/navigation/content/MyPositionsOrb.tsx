import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { useAccount } from 'helpers/useAccount'
import React from 'react'

export function MyPositionsOrb() {
  const { amountOfPositions, walletAddress } = useAccount()

  return (
    <NavigationOrb
      icon="home"
      iconSize={20}
      link={`/owner/${walletAddress}`}
      {...(!!amountOfPositions && { beacon: amountOfPositions })}
    />
  )
}
