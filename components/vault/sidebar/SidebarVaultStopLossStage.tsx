import { StopLossTwoTxRequirement } from 'features/aave/components'
import type { OpenVaultStage } from 'features/borrow/open/pipes/openVault.types'
import type { OpenMultiplyVaultStage } from 'features/multiply/open/pipes/openMultiplyVault.types'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Flex, Image } from 'theme-ui'

export function SidebarVaultStopLossStage(props: {
  stage: OpenVaultStage | OpenMultiplyVaultStage
}) {
  const { stage } = props

  switch (stage) {
    case 'stopLossTxInProgress':
      return (
        <>
          <StopLossTwoTxRequirement typeKey="system.vault" />
          <AddingStopLossAnimation />
        </>
      )
    default:
      return (
        <>
          <StopLossTwoTxRequirement typeKey="system.vault" />
          <Flex sx={{ justifyContent: 'center' }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
          </Flex>
        </>
      )
  }
}
