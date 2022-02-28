import { BigNumber } from 'bignumber.js'
import React from 'react'

import { useAppContext } from '../../../components/AppContextProvider'
import { VaultViewMode } from '../../../components/TabSwitchLayout'
import { AfterPillProps } from '../../../components/vault/VaultDetails'
import { useObservable } from '../../../helpers/observableHook'
import { extractStopLossData } from '../common/StopLossTriggerDataExtractor'
import { TAB_CHANGE_SUBJECT } from '../common/UITypes/TabChange'
import { StopLossBannerLayout } from './StopLossBannerLayout'

interface StopLossBannerControlProps {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  vaultId: BigNumber
  afterLiquidationPrice: BigNumber
}

export function StopLossBannerControl({
  vaultId,
  liquidationPrice,
  liquidationRatio,
  afterLiquidationPrice,
  showAfterPill,
}: StopLossBannerControlProps & AfterPillProps) {
  const { automationTriggersData$, uiChanges } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(vaultId)
  const { value: automationTriggersData } = useObservable(autoTriggersData$)

  const slData = automationTriggersData ? extractStopLossData(automationTriggersData) : null

  if (slData && slData.isStopLossEnabled) {
    const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slData.stopLossLevel)
    const afterDynamicStopPrice = afterLiquidationPrice
      .div(liquidationRatio)
      .times(slData.stopLossLevel)

    return (
      <StopLossBannerLayout
        dynamicStopPrice={dynamicStopPrice}
        afterDynamicStopPrice={afterDynamicStopPrice}
        stopLossLevel={slData.stopLossLevel}
        showAfterPill={showAfterPill}
        handleClick={() => {
          uiChanges.publish(TAB_CHANGE_SUBJECT, { currentMode: VaultViewMode.Protection })
        }}
      />
    )
  }

  return null
}
