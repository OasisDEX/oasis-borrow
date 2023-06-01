import { PositionTransition } from '@oasisdex/dma-library'
import { IPositionTransition, ISimplePositionTransition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { DimmedList } from 'components/DImmedList'
import { OpenFlowStopLossSummary } from 'components/OpenFlowStopLossSummary'
import { StopLossCommonOrderInformation } from 'features/automation/protection/common/controls/StopLossCommonOrderInformation'
import { one, zero } from 'helpers/zero'
import React from 'react'

interface OpenAaveStopLossInformationProps {
  stopLossLevel: BigNumber
  transition?: IPositionTransition | ISimplePositionTransition | PositionTransition
  collateralActive: boolean
}

export function OpenAaveStopLossInformation({
  transition,
  stopLossLevel,
  collateralActive,
}: OpenAaveStopLossInformationProps) {
  const {
    metadata: {
      stopLossMetadata: {
        values: { triggerMaxToken, dynamicStopLossPrice: executionPrice },
      },
    },
  } = useAutomationContext()

  const debt = amountFromWei(
    transition?.simulation.position.debt.amount || zero,
    transition?.simulation.position.debt.precision,
  )

  const lockedCollateral = amountFromWei(
    transition?.simulation.position.collateral.amount || zero,
    transition?.simulation.position.collateral.precision,
  )

  const dynamicStopLossPrice = collateralPriceAtRatio({
    colRatio: stopLossLevel.isZero() ? zero : one.div(stopLossLevel.div(100)),
    collateral: lockedCollateral,
    vaultDebt: debt,
  })

  return (
    <DimmedList>
      <OpenFlowStopLossSummary
        stopLossLevel={stopLossLevel}
        dynamicStopLossPrice={dynamicStopLossPrice}
        ratioTranslationKey="protection.stop-loss-ltv"
      />
      <StopLossCommonOrderInformation
        afterMaxToken={triggerMaxToken}
        isCollateralActive={collateralActive}
        executionPrice={executionPrice}
      />
    </DimmedList>
  )
}
