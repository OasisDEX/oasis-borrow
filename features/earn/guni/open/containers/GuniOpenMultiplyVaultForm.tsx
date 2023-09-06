import React from 'react'
import { OpenGuniVaultState } from 'features/earn/guni/open/pipes/openGuniVault'
import { SidebarOpenGuniVault } from 'features/earn/guni/open/sidebars/SidebarOpenGuniVault'

export function GuniOpenMultiplyVaultForm(props: OpenGuniVaultState) {
  return <SidebarOpenGuniVault {...props} />
}
