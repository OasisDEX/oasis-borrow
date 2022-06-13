import { Vault } from 'blockchain/vaults'
import React from 'react'

import { OptimizationDetailsLayout } from './OptimizationDetailsLayout'

function renderLayout({ vault }: { vault: Vault }) {
  return <OptimizationDetailsLayout vault={vault} />
}

interface OptimizationDetailsControlProps {
  vault: Vault
}

export function OptimizationDetailsControl({ vault }: OptimizationDetailsControlProps) {
  return renderLayout({ vault })
}
