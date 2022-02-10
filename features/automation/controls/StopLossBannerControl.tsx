import { BigNumber } from 'bignumber.js'
import React from 'react'

import { useAppContext } from '../../../components/AppContextProvider'
import { VaultViewMode } from '../../../components/TabSwitchLayout'
import { useObservable } from '../../../helpers/observableHook'
import { extractSLData } from '../common/StopLossTriggerDataExtractor'
import { TAB_CHANGE_SUBJECT } from '../common/UITypes/TabChange'
import { StopLossBannerLayout } from './StopLossBannerLayout'

interface StopLossBannerControlProps {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  vaultId: BigNumber
}

export function StopLossBannerControl({
  vaultId,
  liquidationPrice,
  liquidationRatio,
}: StopLossBannerControlProps) {
  const { automationTriggersData$, uiChanges } = useAppContext()
  const autoTriggersData$ = automationTriggersData$(vaultId)
  const automationTriggersData = useObservable(autoTriggersData$)

  const slData = automationTriggersData ? extractSLData(automationTriggersData) : null

  if (slData && slData.isStopLossEnabled) {
    const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slData.stopLossLevel)

    return (
      <StopLossBannerLayout
        dynamicStopPrice={dynamicStopPrice}
        stopLossLevel={slData.stopLossLevel}
        handleClick={() => {
          uiChanges.publish(TAB_CHANGE_SUBJECT, { currentMode: VaultViewMode.Protection })
        }}
      />
    )
  }

  return null
}
