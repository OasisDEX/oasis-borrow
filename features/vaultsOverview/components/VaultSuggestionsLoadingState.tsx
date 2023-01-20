import { Skeleton } from 'components/Skeleton'
import React from 'react'

export function VaultSuggestionsLoadingState() {
  return <Skeleton cols={3} count={3} height="640px" gap={4} />
}
