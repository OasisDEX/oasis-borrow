import React from 'react'
import { VaultOverviewOwnershipNotice } from 'features/notices/VaultsNoticesView'
import { useAccount } from 'helpers/useAccount'

export function VaultOwnershipNotice({ address }: { address: string }) {
  const { walletAddress } = useAccount()
  const isOwner = address === walletAddress

  return walletAddress && !isOwner ? (
    <VaultOverviewOwnershipNotice account={walletAddress} controller={address} />
  ) : null
}
