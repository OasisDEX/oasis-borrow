import { getAutomationMakerPositionData } from 'features/automation/common/context/getAutomationMakerPositionData'
import { AutomationContextInput } from 'features/automation/contexts/AutomationContextInput'
import { getMakerStopLossMetadata } from 'features/automation/metadata/maker/stopLossMetadata'
import type { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault.types'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import type { PropsWithChildren } from 'react'
import React, { useMemo } from 'react'

interface MakerAutomationContextProps {
  generalManageVault: GeneralManageVaultState
}

export function MakerAutomationContext({
  children,
  generalManageVault,
}: PropsWithChildren<MakerAutomationContextProps>) {
  const positionData = useMemo(
    () => getAutomationMakerPositionData({ generalManageVault }),
    [generalManageVault],
  )
  const {
    vault: { token, controller },
    priceInfo: { nextCollateralPrice },
  } = generalManageVault!.state

  const commonData = useMemo(
    () => ({
      controller,
      nextCollateralPrice,
      token,
    }),
    [controller, nextCollateralPrice.toString(), token],
  )

  return (
    <AutomationContextInput
      positionData={positionData}
      commonData={commonData}
      protocol={VaultProtocol.Maker}
      metadata={{
        stopLoss: getMakerStopLossMetadata,
      }}
    >
      {children}
    </AutomationContextInput>
  )
}
