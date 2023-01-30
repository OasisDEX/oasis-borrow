import React from 'react'

import { VaultHeadline, VaultHeadlineProps } from './VaultHeadline'

export function EarnVaultHeadline({
  header,
  token,
  details,
  followButton,
  shareButton,
}: VaultHeadlineProps) {
  return (
    <VaultHeadline
      header={header}
      token={token}
      details={details}
      followButton={followButton}
      shareButton={shareButton}
    />
  )
}
