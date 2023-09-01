import { Announcement } from 'components/Announcement'
import { useProductContext } from 'components/context'
import { getAddress } from 'ethers/lib/utils'
import { AssetsAndPositionsOverview } from 'features/vaultsOverview/containers/AssetsAndPositionsOverview'
import { ConnectWalletPrompt } from 'features/vaultsOverview/containers/ConnectWalletPrompt'
import { FollowedTable } from 'features/vaultsOverview/containers/FollowedTable'
import { PositionsTable } from 'features/vaultsOverview/containers/PositionsTable'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'

import { VaultOwnershipNotice } from './containers/VaultOwnershipNotice'

export function VaultsOverviewView({ address }: { address: string }) {
  const ajnaSafetySwitchOn = useFeatureToggle('AjnaSafetySwitch')

  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const { ownersPositionsList$ } = useProductContext()
  const { walletAddress } = useAccount()

  const isOwner = address === walletAddress

  const memoizedOwnersPositionList$ = useMemo(
    () => ownersPositionsList$(checksumAddress),
    [checksumAddress],
  )
  const [ownersPositionsListData, ownersPositionsListError] = useObservable(
    memoizedOwnersPositionList$,
  )

  return (
    <Grid sx={{ flex: 1, zIndex: 1, gap: '48px', mt: [0, 4], mb: 5 }} key={address}>
      {ajnaSafetySwitchOn &&
        isOwner &&
        ownersPositionsListData?.ajnaPositions &&
        ownersPositionsListData.ajnaPositions.length > 0 && (
          <Announcement
            text="This is emergency Ajna safety switch message."
            discordLink={EXTERNAL_LINKS.DISCORD}
            link="/"
            linkText="Check blog post/twitter/other place"
            withClose={false}
          />
        )}
      <VaultOwnershipNotice address={address} />
      <AssetsAndPositionsOverview address={address} />
      <PositionsTable
        address={address}
        ownersPositionsListData={ownersPositionsListData}
        ownersPositionsListError={ownersPositionsListError}
      />
      <FollowedTable address={address} />
      <ConnectWalletPrompt />
    </Grid>
  )
}
