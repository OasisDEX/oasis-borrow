import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import React, { useEffect, useState } from 'react'

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
  const { uiChanges } = useAppContext()

  const [lastUIState, lastUIStateSetter] = useState<AddFormChange | undefined>(
    uiChanges.lastPayload(ADD_FORM_CHANGE),
  )

  useEffect(() => {
    const uiChanges$ = uiChanges.subscribe<AddFormChange>(ADD_FORM_CHANGE)

    const subscription = uiChanges$.subscribe((value) => {
      lastUIStateSetter(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return renderLayout(
    extractStopLossData(automationTriggersData),
    vault,
    collateralPrices,
    ilkData,
    lastUIState,
  )
}
