import { Vault } from 'blockchain/vaults'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import React from 'react'

interface SidebarSetupAutoBuyProps {
  vault: Vault
}

export function SidebarSetupAutoBuy({ vault }: SidebarSetupAutoBuyProps) {
  return (
    <SidebarSection
      title="Auto Buy Setup"
      content={<>An optimization form for vault#{vault.id.toNumber()}</>}
      primaryButton={{
        label: 'Primary button',
        disabled: true,
      }}
    />
  )
}
