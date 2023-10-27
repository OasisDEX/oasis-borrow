import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { home } from 'theme/icons'

export function MyPositionsOrb() {
  const { amountOfPositions, walletAddress } = useAccount()

  return (
    <NavigationOrb
      icon={home}
      iconSize={16}
      link={getPortfolioLink(walletAddress)}
      {...(!!amountOfPositions && { beacon: amountOfPositions })}
    />
  )
}
