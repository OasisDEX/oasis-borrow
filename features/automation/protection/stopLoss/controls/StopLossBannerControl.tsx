import { BigNumber } from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { AfterPillProps } from 'components/vault/VaultDetails'
import { StopLossBannerLayout } from 'features/automation/protection/stopLoss/controls/StopLossBannerLayout'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange'
import React from 'react'

interface StopLossBannerControlProps {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  afterLiquidationPrice?: BigNumber
  compact?: boolean
  onClick?: () => void
}

export function StopLossBannerControl({
  liquidationPrice,
  liquidationRatio,
  afterLiquidationPrice,
  showAfterPill,
  compact = false,
  onClick,
}: StopLossBannerControlProps & AfterPillProps) {
  const { uiChanges } = useAppContext()
  const {
    triggerData: { stopLossTriggerData },
  } = useAutomationContext()

  if (stopLossTriggerData.isStopLossEnabled) {
    const dynamicStopPrice = liquidationPrice
      .div(liquidationRatio)
      .times(stopLossTriggerData.stopLossLevel)
    const afterDynamicStopPrice =
      afterLiquidationPrice &&
      afterLiquidationPrice.div(liquidationRatio).times(stopLossTriggerData.stopLossLevel)

    return (
      <StopLossBannerLayout
        dynamicStopPrice={dynamicStopPrice}
        afterDynamicStopPrice={afterDynamicStopPrice}
        stopLossLevel={stopLossTriggerData.stopLossLevel}
        showAfterPill={showAfterPill}
        handleClick={() => {
          uiChanges.publish(TAB_CHANGE_SUBJECT, {
            type: 'change-tab',
            currentMode: VaultViewMode.Protection,
          })
          onClick && onClick()
        }}
        compact={compact}
      />
    )
  }

  return null
}
