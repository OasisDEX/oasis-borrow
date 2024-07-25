import React from 'react'

import type { VaultHeadlineProps } from './VaultHeadline'
import { VaultHeadline } from './VaultHeadline'

export function EarnVaultHeadline({ header, tokens, details, shareButton }: VaultHeadlineProps) {
  return (
    <VaultHeadline header={header} tokens={tokens} details={details} shareButton={shareButton} />
  )
}
