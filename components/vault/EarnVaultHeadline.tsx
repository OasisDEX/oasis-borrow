import React from 'react'

import { VaultHeadline, VaultHeadlineProps } from './VaultHeadline'

export function EarnVaultHeadline({
  header,
  token,
  details,
  followButtonProps,
}: VaultHeadlineProps) {
  return (
    <VaultHeadline
      header={header}
      token={token}
      details={details}
      followButtonProps={followButtonProps}
    />
  )
}
