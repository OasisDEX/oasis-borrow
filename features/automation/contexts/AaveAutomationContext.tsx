import type { AaveV2ReserveConfigurationData } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import type { ManageAaveContext } from 'features/aave/manage/state'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import { getAutomationAavePositionData } from 'features/automation/common/context/getAutomationAavePositionData'
import { AutomationContextInput } from 'features/automation/contexts/AutomationContextInput'
import { createGetAaveStopLossMetadata } from 'features/automation/metadata/aave/stopLossMetadata'
import { defaultStopLossData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.constants'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { zero } from 'helpers/zero'
import type { PropsWithChildren } from 'react'
import React, { useMemo } from 'react'

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
        stopLoss: createGetAaveStopLossMetadata(
          aaveManageVault.strategyConfig.protocol,
          aaveManageVault.strategyConfig.networkId,
        ),
      }}
      overwriteTriggersDefaults={{
        stopLossTriggerData: defaultStopLossTriggerData,
      }}
    >
      {children}
    </AutomationContextInput>
  )
}
