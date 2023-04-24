import { AssetsAndPositionsOverview } from 'features/vaultsOverview/containers/AssetsAndPositionsOverview'
import { ConnectWalletPrompt } from 'features/vaultsOverview/containers/ConnectWalletPrompt'
import { FollowedTable } from 'features/vaultsOverview/containers/FollowedTable'
import { PositionsTable } from 'features/vaultsOverview/containers/PositionsTable'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Grid } from 'theme-ui'

import { PositionsList } from './containers/PositionsList'
import { VaultOwnershipNotice } from './containers/VaultOwnershipNotice'
import { VaultSuggestions } from './containers/VaultSuggestions'

export function VaultsOverviewView({ address }: { address: string }) {
  const followVaultsEnabled = useFeatureToggle('FollowVaults')

  return (
    <Grid sx={{ flex: 1, zIndex: 1, gap: 4, mt: [0, 4], mb: 5 }} key={address}>
      <VaultOwnershipNotice address={address} />
      <AssetsAndPositionsOverview address={address} />
      {!followVaultsEnabled ? (
        <PositionsList address={address} />
      ) : (
        <>
          <PositionsTable address={address} />
          <FollowedTable address={address} />
        </>
      )}
      <ConnectWalletPrompt />
      <VaultSuggestions address={address} />
    </Grid>
  )
}
