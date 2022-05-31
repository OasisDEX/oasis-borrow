import { storiesOf } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Container, Heading } from 'theme-ui'
import { InjectTokenIconsDefs } from 'theme/tokenIcons'

import { Summary } from './Summary'
import { VaultSummary } from './vaultSummary'

const stories = storiesOf('Vault summary', module)

const StoryContainer = ({ children, title }: { title: string } & WithChildren) => {
  return (
    <Container variant="appContainer">
      <InjectTokenIconsDefs />
      <Heading variant="smallHeading" sx={{ mt: 5, mb: 3, textAlign: 'left' }}>
        {title}
      </Heading>
      {children}
    </Container>
  )
}

stories.add('One vault', () => {
  const summary: VaultSummary = {
    totalCollateralPrice: new BigNumber(1),
    numberOfVaults: 1,
    totalDaiDebt: new BigNumber(1),
    vaultsAtRisk: 0,
    depositedAssetRatio: {
      ETH: new BigNumber(1),
    },
  }
  return (
    <StoryContainer title="One vault">
      <Summary summary={summary} />
    </StoryContainer>
  )
})

stories.add('Multiple Vaults', () => {
  const summary: VaultSummary = {
    totalCollateralPrice: new BigNumber(1),
    numberOfVaults: 3,
    totalDaiDebt: new BigNumber(1),
    vaultsAtRisk: 0,
    depositedAssetRatio: {
      ETH: new BigNumber(0.5),
      BAT: new BigNumber(0.3),
      LINK: new BigNumber(0.2),
    },
  }
  return (
    <StoryContainer title="Multiple Vaults">
      <Summary summary={summary} />
    </StoryContainer>
  )
})

stories.add('Hidden collateral type', () => {
  const summary: VaultSummary = {
    totalCollateralPrice: new BigNumber(1),
    numberOfVaults: 10,
    totalDaiDebt: new BigNumber(1),
    vaultsAtRisk: 0,
    depositedAssetRatio: {
      UNIV2ETHUSDT: new BigNumber(0.5),
      BAT: new BigNumber(0.3),
      LINK: new BigNumber(0.1),
      COMP: new BigNumber(0.05),
      WBTC: new BigNumber(0.05),
    },
  }
  return (
    <StoryContainer title="Hidden collateral type">
      <Summary summary={summary} />
    </StoryContainer>
  )
})

stories.add('Vault at risk', () => {
  const summary: VaultSummary = {
    totalCollateralPrice: new BigNumber(1),
    numberOfVaults: 2,
    totalDaiDebt: new BigNumber(1),
    vaultsAtRisk: 1,
    depositedAssetRatio: {
      ETH: new BigNumber(0.5),
      BAL: new BigNumber(0.5),
    },
  }
  return (
    <StoryContainer title="Vault at risk">
      <Summary summary={summary} />
    </StoryContainer>
  )
})

stories.add('Handle big numbers', () => {
  const summary: VaultSummary = {
    totalCollateralPrice: new BigNumber(1000000000),
    numberOfVaults: 20,
    totalDaiDebt: new BigNumber(100000000),
    vaultsAtRisk: 0,
    depositedAssetRatio: {
      ETH: new BigNumber(0.5),
      BAL: new BigNumber(0.5),
    },
  }
  return (
    <StoryContainer title="Handle big numbers">
      <Summary summary={summary} />
    </StoryContainer>
  )
})
