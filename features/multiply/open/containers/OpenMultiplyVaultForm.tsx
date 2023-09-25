import type { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault.types'
import { SidebarOpenMultiplyVault } from 'features/multiply/open/sidebars/SidebarOpenMultiplyVault'
import React from 'react'

export function OpenMultiplyVaultForm(props: OpenMultiplyVaultState) {
  return <SidebarOpenMultiplyVault {...props} />
}
