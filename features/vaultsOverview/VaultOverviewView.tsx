import { FollowedList } from 'features/vaultsOverview/containers/FollowedList'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { AssetsAndPositionsOverview } from './containers/AssetsAndPositionsOverview'
import { ConnectWalletPrompt } from './containers/ConnectWalletPrompt'
import { PositionsList } from './containers/PositionsList'
import { VaultOwnershipNotice } from './containers/VaultOwnershipNotice'
import { VaultSuggestions } from './containers/VaultSuggestions'

interface Props {
  address: string
}

export function VaultsOverviewView({ address }: Props) {
  const followVaultsEnabled = useFeatureToggle('FollowVaults')

  return (
    <Grid sx={{ flex: 1, zIndex: 1, gap: 4 }}>
      <VaultOwnershipNotice address={address} />
      <Flex sx={{ mt: 5, flexDirection: 'column' }}>
        <AssetsAndPositionsOverview address={address} />

        <ConnectWalletPrompt address={address} />
      </Flex>

      <PositionsList address={address} />
      {followVaultsEnabled && <FollowedList address={address} />}

      <VaultSuggestions address={address} />
    </Grid>
  )
}
