import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { usePortfolioPositionsCount } from 'helpers/clients/portfolio-positions-count'
import { getLocalAppConfig } from 'helpers/config'
import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useAccount } from 'helpers/useAccount'
import React from 'react'
import { home } from 'theme/icons'

export function MyPositionsOrb() {
  const { NewPortfolio } = getLocalAppConfig('features')
  const { amountOfPositions: oldAmountOfPositions, walletAddress } = useAccount()
  const { amountOfPositions: newAmountOfPositions } = usePortfolioPositionsCount({
    address: walletAddress?.toLowerCase(),
  })
  const amountOfPositions = NewPortfolio ? newAmountOfPositions : oldAmountOfPositions

  return (
    <NavigationOrb
      icon={home}
      iconSize={16}
      link={getPortfolioLink(walletAddress)}
      {...(!!amountOfPositions && { beacon: amountOfPositions })}
    />
  )
}
