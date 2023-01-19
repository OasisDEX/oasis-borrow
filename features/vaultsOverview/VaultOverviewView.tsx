import { AssetsAndPositionsOverview } from 'features/vaultsOverview/containers/AssetsAndPositionsOverview'
import { ConnectWalletPrompt } from 'features/vaultsOverview/containers/ConnectWalletPrompt'
import { FollowedTable } from 'features/vaultsOverview/containers/FollowedTable'
import { PositionsTable } from 'features/vaultsOverview/containers/PositionsTable'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

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

      {!followVaultsEnabled ? (
        <PositionsList address={address} />
      ) : (
        <>
          <PositionsTable address={address} />
          <FollowedTable address={address} />
        </>
      )}
      <VaultSuggestions address={address} />
    </Grid>
  )
}
