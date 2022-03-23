import { BigNumber } from 'bignumber.js'
import React from 'react'

import { useAppContext } from '../../../components/AppContextProvider'
import { VaultViewMode } from '../../../components/VaultTabSwitch'
import { calculatePriceImpact } from '../../shared/priceImpact'
import {
  CloseVaultExitCollateralMultipleEvent,
  CloseVaultExitDaiMultipleEvent,
} from '../../vaultHistory/vaultHistoryEvents'
import { TAB_CHANGE_SUBJECT } from '../common/UITypes/TabChange'
import { StopLossTriggeredFormLayout } from './StopLossTriggeredFormLayout'

interface StopLossTriggeredFormControlProps {
  closeEvent: CloseVaultExitDaiMultipleEvent | CloseVaultExitCollateralMultipleEvent
  onClick: () => void
}

export function StopLossTriggeredFormControl({
  closeEvent,
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

  const outstandingDebt = closeEvent.beforeDebt
  const isToCollateral = closeEvent.kind === 'CLOSE_VAULT_TO_COLLATERAL'
  const withdrawAmount = isToCollateral ? closeEvent.exitCollateral : closeEvent.exitDai
  const tokenPrice = closeEvent.marketPrice
  const priceImpact = calculatePriceImpact(closeEvent.oraclePrice, closeEvent.marketPrice)
  const totalFee = closeEvent.totalFee
  const token = closeEvent.token
  const slippage = new BigNumber(2) // TODO missing info in cache
  const date = closeEvent.timestamp
  const tokensSold = closeEvent.sold
  const collRatio = closeEvent.beforeCollateralizationRatio

  return (
    <StopLossTriggeredFormLayout
      token={token}
      onClick={handleClick}
      paybackAmount={outstandingDebt}
      withdrawAmount={withdrawAmount}
      tokensSold={tokensSold}
      tokenPrice={tokenPrice}
      priceImpact={priceImpact}
      date={date}
      totalFee={totalFee}
      collRatio={collRatio}
      slippage={slippage}
      isToCollateral={isToCollateral}
    />
  )
}
