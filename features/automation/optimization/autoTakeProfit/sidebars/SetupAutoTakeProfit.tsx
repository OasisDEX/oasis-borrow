// import { Vault } from 'blockchain/vaults'
import { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import React from 'react'

interface SetupAutoTakeProfitProps {
  //   vault: Vault
  isAutoTakeProfitActive: boolean
}

export function SetupAutoTakeProfit({ isAutoTakeProfitActive }: SetupAutoTakeProfitProps) {
    // TODO ŁW determine title upon conditions
    // const sidebarTitle = getAutomationFormTitle({
    //     flow,
    //     stage,
    //     feature,
    //   })
  
    if (isAutoTakeProfitActive) {
        // TODO ŁW
    // const sidebarSectionProps: SidebarSectionProps: {
        
    // }
}

  return (
    <>
      <div>SetupAutoTakeProfit</div>
    </>
  )
}
