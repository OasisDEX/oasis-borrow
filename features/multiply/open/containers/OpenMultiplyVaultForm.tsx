import React from 'react'
import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import { SidebarOpenMultiplyVault } from 'features/multiply/open/sidebars/SidebarOpenMultiplyVault'

export function OpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  return <SidebarOpenMultiplyVault {...props} />
}
