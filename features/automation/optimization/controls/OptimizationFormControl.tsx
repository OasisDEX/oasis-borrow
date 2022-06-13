import { Vault } from 'blockchain/vaults'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import React from 'react'

interface OptimizationFormControlProps {
  vault: Vault
}

export function OptimizationFormControl({ vault }: OptimizationFormControlProps) {
  return (
    <SidebarSection
      title="Title"
      content={<>An optimization form for vault#{vault.id.toNumber()}</>}
      primaryButton={{
        label: 'Primary button',
        disabled: true,
      }}
    />
  )
}
