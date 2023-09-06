import React from 'react'
import { Skeleton } from 'components/Skeleton'

export function VaultSuggestionsLoadingState() {
  return <Skeleton cols={3} count={3} height="640px" gap={4} />
}
