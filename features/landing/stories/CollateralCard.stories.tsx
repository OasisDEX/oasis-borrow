import { Flex } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { WithChildren } from 'helpers/types'
import React from 'react'

import { getToken, tokens } from '../../../blockchain/tokensMetadata'
import { CollateralCard } from '../CollateralCard'

const StoryContainer = ({ children }: WithChildren) => {
  return <Flex sx={{ flexWrap: 'wrap', flex: '' }}>{children}</Flex>
}

export function SingleCollateralCardSingleIlk({ collateral }: { collateral: string }) {
  const ilks = [
    { liquidationPenalty: new BigNumber('0.13'), liquidationRatio: new BigNumber('1.45') },
  ] as IlkData[]
  const token = getToken(collateral)
  return (
    <StoryContainer>
      <CollateralCard
        ilks={ilks}
        title={token.symbol}
        background={token.background!}
        icon={token.bannerIconPng!}
        onClick={() => {}}
      />
    </StoryContainer>
  )
}

export function SingleCollateralCardMultipleIlk({ collateral }: { collateral: string }) {
  const ilks = [
    { liquidationPenalty: new BigNumber('0.13'), liquidationRatio: new BigNumber('1.45') },
    { liquidationPenalty: new BigNumber('0.2'), liquidationRatio: new BigNumber('1.2') },
  ] as IlkData[]
  const token = getToken(collateral)
  return (
    <StoryContainer>
      <CollateralCard
        ilks={ilks}
        title={token.symbol}
        background={token.background!}
        icon={token.bannerIconPng!}
        onClick={() => {}}
      />
    </StoryContainer>
  )
}

export function LpTokenCard() {
  const ilks = [
    { liquidationPenalty: new BigNumber('0.13'), liquidationRatio: new BigNumber('1.45') },
    { liquidationPenalty: new BigNumber('0.2'), liquidationRatio: new BigNumber('1.2') },
  ] as IlkData[]
  const token = getToken('UNIV2DAIUSDT')
  return (
    <StoryContainer>
      <CollateralCard
        ilks={ilks}
        title={'UNI LP Tokens'}
        background={token.background!}
        icon={token.bannerIconPng!}
        onClick={() => {}}
      />
    </StoryContainer>
  )
}

export function AllCollateralCards() {
  const allCollaterals = tokens
    .filter((token) => token.background !== undefined)
    .filter((token) => !(token.tags as string[]).includes('lp-token'))
    .map((token) => ({
      token,
      ilks: [
        { liquidationPenalty: new BigNumber('0.1'), liquidationRatio: new BigNumber('1.45') },
        { liquidationPenalty: new BigNumber('0.2'), liquidationRatio: new BigNumber('1.3') },
      ] as IlkData[],
    }))

  return (
    <StoryContainer>
      {allCollaterals.map(({ token, ilks }) => {
        return (
          <CollateralCard
            title={token.symbol}
            background={token.background!}
            icon={token.bannerIconPng!}
            onClick={() => {}}
            ilks={ilks}
          />
        )
      })}
    </StoryContainer>
  )
}

// eslint-disable-next-line import/no-default-export
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
