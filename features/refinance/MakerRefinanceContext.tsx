import { getAutomationMakerPositionData } from 'features/automation/common/context/getAutomationMakerPositionData'
import type { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault.types'
import { LendingProtocol } from 'lendingProtocols'
import type { PropsWithChildren } from 'react'
import React, { useMemo } from 'react'

import { type IPosition, RefinanceContextProvider } from './RefinanceContext'
import { getProtocolNameByLendingProtocol } from './sdkMappings'

interface MakerRefinanceContextProps {
  generalManageVault: GeneralManageVaultState
}

export function MakerRefinanceContext({
  children,
  generalManageVault,
}: PropsWithChildren<MakerRefinanceContextProps>) {
  const positionData = useMemo(
    () => getAutomationMakerPositionData({ generalManageVault }),
    [generalManageVault],
  )
  const position: IPosition = {
    poolId: {
      protocol: {
        name: getProtocolNameByLendingProtocol(LendingProtocol.Maker),
      },
    },
    data: {
      ilk: positionData.ilk,
    },
  }

  return <RefinanceContextProvider position={position}>{children}</RefinanceContextProvider>
}
