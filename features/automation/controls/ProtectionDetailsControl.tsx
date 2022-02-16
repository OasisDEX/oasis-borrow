import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { CollateralPricesWithFilters } from 'features/collateralPrices/collateralPricesWithFilters'
import React, { useEffect, useState } from 'react'

import { extractStopLossData, StopLossTriggerData } from '../common/StopLossTriggerDataExtractor'
import { AddFormChange } from '../common/UITypes/AddFormChange'
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
    isStaticPrice: collateralPrice.isStaticPrice,
    token: vaultData.token,

    // protectionState mocked for now
    protectionState: {
      inputAmountsEmpty: false,
      stage: 'editing',
      afterSlRatio: lastUIState ? lastUIState.selectedSLValue.dividedBy(100) : new BigNumber(0),
    },
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
  const uiSubjectName = 'AdjustSlForm'
  const { uiChanges } = useAppContext()

  const [lastUIState, lastUIStateSetter] = useState<AddFormChange | undefined>(undefined)

  useEffect(() => {
    console.log('Subscribing to uiChanges')
    const uiChanges$ = uiChanges.subscribe<AddFormChange>(uiSubjectName)

    const subscription = uiChanges$.subscribe((value) => {
      lastUIStateSetter(value)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  console.log('rendering ProtDetailsControl')

  return renderLayout(
    extractStopLossData(automationTriggersData),
    vault,
    collateralPrices,
    ilkData,
    lastUIState,
  )
}
