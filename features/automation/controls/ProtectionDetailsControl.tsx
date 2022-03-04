import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

import { extractStopLossData, StopLossTriggerData } from '../common/StopLossTriggerDataExtractor'
import { ADD_FORM_CHANGE, AddFormChange } from '../common/UITypes/AddFormChange'
import { TriggersData } from '../triggers/AutomationTriggersData'
import { ProtectionDetailsLayout, ProtectionDetailsLayoutProps } from './ProtectionDetailsLayout'

function renderLayout(
  triggersData: StopLossTriggerData,
  vaultData: Vault,
  collateralPrices: CollateralPricesWithFilters,
  ilkData: IlkData,
  lastUIState: AddFormChange | undefined,
) {
  const collateralPrice = collateralPrices.data.filter((x) => x.token === vaultData.token)[0]

  const props: ProtectionDetailsLayoutProps = {
    isStopLossEnabled: triggersData.isStopLossEnabled,
    slRatio: triggersData.stopLossLevel,
    vaultDebt: vaultData.debt,
    currentOraclePrice: collateralPrice.currentPrice,
    nextOraclePrice: collateralPrice.nextPrice,
    lockedCollateral: vaultData.lockedCollateral,

    liquidationRatio: ilkData.liquidationRatio,
    liquidationPenalty: ilkData.liquidationPenalty,
    isStaticPrice: collateralPrice.isStaticPrice,
    token: vaultData.token,

    afterSlRatio: lastUIState ? lastUIState.selectedSLValue?.dividedBy(100) : new BigNumber(0),
    isCollateralActive: !!lastUIState?.collateralActive,
  }
  return <ProtectionDetailsLayout {...props} />
}

interface ProtectionDetailsControlProps {
  ilkData: IlkData
  automationTriggersData: TriggersData
  collateralPrices: CollateralPricesWithFilters
  vault: Vault
}

export function ProtectionDetailsControl({
  ilkData,
  automationTriggersData,
  collateralPrices,
  vault,
}: ProtectionDetailsControlProps) {
  const [lastUIState] = useUIChanges<AddFormChange>(ADD_FORM_CHANGE)

  return renderLayout(
    extractStopLossData(automationTriggersData),
    vault,
    collateralPrices,
    ilkData,
    lastUIState,
  )
}
