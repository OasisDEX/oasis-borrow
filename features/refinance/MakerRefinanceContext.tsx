import { RiskRatio } from '@oasisdex/dma-library'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import type { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault.types'
import { getMakerRefinanceContextInputs } from 'features/refinance/helpers/getMakerRefinanceContextInputs'
import type { PropsWithChildren } from 'react'
import React from 'react'

import { RefinanceContextProvider } from './RefinanceContext'

interface MakerRefinanceContextProps {
  generalManageVault: GeneralManageVaultState
  chainId: number
  address?: string
}

export function MakerRefinanceContext({
  children,
  generalManageVault,
  chainId,
  address,
}: PropsWithChildren<MakerRefinanceContextProps>) {
  // return children
  const { vault, priceInfo } = generalManageVault.state
  const slippage = generalManageVault.state.slippage.toNumber()
  const { triggerData } = useAutomationContext()

  const liquidationPrice = generalManageVault.state.vault.liquidationPrice.toString()
  const borrowRate = generalManageVault.state.ilkData.stabilityFee.toString()
  const ltv = new RiskRatio(
    generalManageVault.state.vault.collateralizationRatio,
    RiskRatio.TYPE.COL_RATIO,
  )
  const maxLtv = new RiskRatio(
    generalManageVault.state.ilkData.liquidationRatio,
    RiskRatio.TYPE.COL_RATIO,
  )

  const automations = {
    stopLoss: {
      enabled: triggerData.stopLossTriggerData.isStopLossEnabled,
    },
    autoSell: {
      enabled: triggerData.autoSellTriggerData.isTriggerEnabled,
    },
    autoBuy: {
      enabled: triggerData.autoBuyTriggerData.isTriggerEnabled,
    },
    takeProfit: {
      enabled: triggerData.autoTakeProfitTriggerData.isTriggerEnabled,
    },
    constantMultiple: {
      enabled: triggerData.constantMultipleTriggerData.isTriggerEnabled,
    },
  }

  const ctx = getMakerRefinanceContextInputs({
    address,
    chainId,
    collateralAmount: vault.lockedCollateral.toString(),
    collateralToken: vault.token,
    debtAmount: vault.debt.toString(),
    id: vault.id.toString(),
    slippage,
    collateralPrice: priceInfo.currentCollateralPrice.toString(),
    liquidationPrice,
    borrowRate,
    ltv,
    maxLtv,
    automations,
    ilkType: vault.ilk,
  })

  return <RefinanceContextProvider contextInput={ctx}>{children}</RefinanceContextProvider>
}
