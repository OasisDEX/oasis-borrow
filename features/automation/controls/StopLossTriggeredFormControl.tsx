import React from 'react'

import { useAppContext } from '../../../components/AppContextProvider'
import { VaultViewMode } from '../../../components/VaultTabSwitch'
import { VaultHistoryEvent } from '../../vaultHistory/vaultHistory'
import { TriggerType } from '../common/enums/TriggersTypes'
import { TAB_CHANGE_SUBJECT } from '../common/UITypes/TabChange'
import { mockTriggeredEvent } from './StopLossTriggeredBannerControl'
import { StopLossTriggeredFormLayout } from './StopLossTriggeredFormLayout'

interface StopLossTriggeredFormControlProps {
  vaultHistory: VaultHistoryEvent[]
  onClick: () => void
}

export function StopLossTriggeredFormControl({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vaultHistory,
  onClick,
}: StopLossTriggeredFormControlProps) {
  const { uiChanges } = useAppContext()

  const handleClick = () => {
    uiChanges.publish(TAB_CHANGE_SUBJECT, {
      type: 'change-tab',
      currentMode: VaultViewMode.Overview,
    })
    onClick()
  }

  const stopLossTriggeredEvent =
    // TODO STOPLOSS-TRIGGERED EVENT IS NOT PREPARED YET, MOCKED FOR NOW
    // vaultHistory[0].kind === 'STOPLOSS-TRIGGERED' && historyMap[vaultType][0]
    mockTriggeredEvent

  const {
    daiAmount,
    collateralAmount,
    oraclePrice,
    timestamp,
    gasFee,
    token,
    slippage,
    triggerType,
  } = stopLossTriggeredEvent

  const paybackAmount = daiAmount.abs()
  const withdrawAmount = collateralAmount.abs()
  const tokensSold = daiAmount.abs().dividedBy(oraclePrice)
  const date = new Date(timestamp)
  const collRatio = withdrawAmount.multipliedBy(oraclePrice).dividedBy(paybackAmount)
  const isToCollateral = triggerType === TriggerType.StopLossToCollateral

  return (
    <StopLossTriggeredFormLayout
      token={token}
      onClick={handleClick}
      paybackAmount={paybackAmount}
      withdrawAmount={withdrawAmount}
      tokensSold={tokensSold}
      tokenPrice={oraclePrice}
      date={date}
      gasFee={gasFee}
      collRatio={collRatio}
      slippage={slippage}
      isToCollateral={isToCollateral}
    />
  )
}
