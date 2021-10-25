import { Flex, Grid } from '@theme-ui/components'
import { tokens } from '../../../blockchain/tokensMetadata'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { CollateralCard } from '../FeaturedIlks'
import { IlkData } from 'blockchain/ilks'
import BigNumber from 'bignumber.js'

const StoryContainer = ({ children }: WithChildren) => {
  return <Flex sx={{ flexWrap: 'wrap', flex: '' }}>{children}</Flex>
}

export function SingleCollateralCardSingleIlk({ collateral }: { collateral: string }) {
  const ilks = [
    { liquidationPenalty: new BigNumber('0.13'), liquidationRatio: new BigNumber('1.45') },
  ] as IlkData[]
  return (
    <StoryContainer>
      <CollateralCard ilks={ilks} collateral={collateral} onClick={() => {}} />
    </StoryContainer>
  )
}

export function SingleCollateralCardMultipleIlk({ collateral }: { collateral: string }) {
  const ilks = [
    { liquidationPenalty: new BigNumber('0.13'), liquidationRatio: new BigNumber('1.45') },
    { liquidationPenalty: new BigNumber('0.2'), liquidationRatio: new BigNumber('1.2') },
  ] as IlkData[]
  return (
    <StoryContainer>
      <CollateralCard ilks={ilks} collateral={collateral} onClick={() => {}} />
    </StoryContainer>
  )
}

export function AllCollateralCards() {
  const allCollaterals = tokens
    .filter((token) => token.background !== undefined)
    .map((token) => ({
      token,
      ilks: [
        { liquidationPenalty: new BigNumber('0.1'), liquidationRatio: new BigNumber('1.45') },
        { liquidationPenalty: new BigNumber('0.2'), liquidationRatio: new BigNumber('1.3') },
      ] as IlkData[],
    }))

  return (
    <StoryContainer>
      {allCollaterals.map(({ token, ilks }) => (
        <CollateralCard collateral={token.symbol} onClick={() => {}} ilks={ilks} />
      ))}
    </StoryContainer>
  )
}

export default {
  title: 'Collateral Cards',
  argTypes: {
    collateral: {
      description: 'Select collateral',
      options: ['ETH', 'WBTC', 'BAT', 'UNI'],
      control: { type: 'radio' },
      defaultValue: 'ETH',
    },
  },
}
