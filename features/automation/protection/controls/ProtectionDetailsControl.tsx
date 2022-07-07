import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

import { getIsEditingProtection } from '../common/helpers'
import { extractStopLossData, StopLossTriggerData } from '../common/StopLossTriggerDataExtractor'
import { ADD_FORM_CHANGE, AddFormChange } from '../common/UITypes/AddFormChange'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'

function renderLayout(
  triggersData: StopLossTriggerData,
  vaultData: Vault,
  priceInfo: PriceInfo,
  ilkData: IlkData,
  lastUIState: AddFormChange,
) {
  const props: ProtectionDetailsLayoutProps = {
    isStopLossEnabled: triggersData.isStopLossEnabled,
    slRatio: triggersData.stopLossLevel,
    vaultDebt: vaultData.debt,
    currentOraclePrice: priceInfo.currentCollateralPrice,
    nextOraclePrice: priceInfo.nextCollateralPrice,
    lockedCollateral: vaultData.lockedCollateral,
    collateralizationRatioAtNextPrice: vaultData.collateralizationRatioAtNextPrice,

    liquidationRatio: ilkData.liquidationRatio,
    liquidationPenalty: ilkData.liquidationPenalty,
    isStaticPrice: priceInfo.isStaticCollateralPrice,
    token: vaultData.token,

    afterSlRatio: lastUIState ? lastUIState.selectedSLValue?.dividedBy(100) : new BigNumber(0),
    isCollateralActive: !!lastUIState?.collateralActive,
    isEditing: getIsEditingProtection({
      isStopLossEnabled: triggersData.isStopLossEnabled,
      selectedSLValue: lastUIState.selectedSLValue,
      stopLossLevel: triggersData.stopLossLevel,
      collateralActive: lastUIState.collateralActive,
      isToCollateral: triggersData.isToCollateral,
    }),
  }
  return <ProtectionDetailsLayout {...props} />
}

interface ProtectionDetailsControlProps {
  ilkData: IlkData
  automationTriggersData: TriggersData
  priceInfo: PriceInfo
  vault: Vault
}

export function ProtectionDetailsControl({
  ilkData,
  automationTriggersData,
  priceInfo,
  vault,
}: ProtectionDetailsControlProps) {
  const [lastUIState] = useUIChanges<AddFormChange>(ADD_FORM_CHANGE)

  return renderLayout(
    extractStopLossData(automationTriggersData),
    vault,
    priceInfo,
    ilkData,
    lastUIState,
  )
}
