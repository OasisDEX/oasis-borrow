import { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault'
import { SidebarOpenMultiplyVault } from 'features/multiply/open/sidebars/SidebarOpenMultiplyVault'
import React from 'react'

export function OpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  return <SidebarOpenMultiplyVault {...props} />
}
