import { AaveV2ReserveConfigurationData } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { ManageAaveContext } from 'features/aave/manage/state'
import { getAutomationAavePositionData } from 'features/automation/common/context/getAutomationAavePositionData'
import { AutomationContextInput } from 'features/automation/contexts/AutomationContextInput'
import { getAaveStopLossMetadata } from 'features/automation/metadata/aave/stopLossMetadata'
import { defaultStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { zero } from 'helpers/zero'
import React, { PropsWithChildren, useMemo } from 'react'

export interface AaveManageVaultState {
  address: string
  aaveReserveState: AaveV2ReserveConfigurationData
  strategyConfig: IStrategyConfig
  context: ManageAaveContext
}

interface AaveAutomationContextProps {
  aaveManageVault: AaveManageVaultState
}

export function AaveAutomationContext({
  children,
  aaveManageVault,
}: PropsWithChildren<AaveAutomationContextProps>) {
  const positionData = useMemo(
    () => getAutomationAavePositionData({ aaveManageVault }),
    [aaveManageVault],
  )

  const commonData = useMemo(
    () => ({
      controller: aaveManageVault.address,
      nextCollateralPrice: aaveManageVault.context.collateralPrice || zero,
      token: aaveManageVault.context.tokens.collateral,
    }),
    [aaveManageVault],
  )

  const defaultStopLossTriggerData = {
    ...defaultStopLossData,
    isToCollateral: false,
  }

  return (
    <AutomationContextInput
      positionData={positionData}
      commonData={commonData}
      protocol={VaultProtocol.Aave}
      metadata={{
        stopLoss: getAaveStopLossMetadata,
      }}
      overwriteTriggersDefaults={{
        stopLossTriggerData: defaultStopLossTriggerData,
      }}
    >
      {children}
    </AutomationContextInput>
  )
}
