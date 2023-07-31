import React from 'react'

import { VaultHeadline, VaultHeadlineProps } from './VaultHeadline'

export function EarnVaultHeadline({
  header,
  tokens,
  details,
  followButton,
  shareButton,
}: VaultHeadlineProps) {
  return (
    <VaultHeadline
      header={header}
      tokens={tokens}
      details={details}
      followButton={followButton}
      shareButton={shareButton}
    />
  )
}
