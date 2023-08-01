import { AssetsAndPositionsOverview } from 'features/vaultsOverview/containers/AssetsAndPositionsOverview'
import { ConnectWalletPrompt } from 'features/vaultsOverview/containers/ConnectWalletPrompt'
import { FollowedTable } from 'features/vaultsOverview/containers/FollowedTable'
import { PositionsTable } from 'features/vaultsOverview/containers/PositionsTable'
import React from 'react'
import { Grid } from 'theme-ui'

import { VaultOwnershipNotice } from './containers/VaultOwnershipNotice'

export function VaultsOverviewView({ address }: { address: string }) {
  return (
    <Grid sx={{ flex: 1, zIndex: 1, gap: '48px', mt: [0, 4], mb: 5 }} key={address}>
      <VaultOwnershipNotice address={address} />
      <AssetsAndPositionsOverview address={address} />
      <PositionsTable address={address} />
      <FollowedTable address={address} />
      <ConnectWalletPrompt />
    </Grid>
  )
}
