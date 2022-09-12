import React from 'react'

import { VaultHeadline, VaultHeadlineProps } from './VaultHeadline'

export function EarnVaultHeadline({ header, token, details }: VaultHeadlineProps) {
  return <VaultHeadline header={header} token={token} details={details} />
}
