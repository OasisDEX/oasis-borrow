import { IPositionTransition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { DimmedList } from 'components/DImmedList'
import { OpenFlowStopLossSummary } from 'components/OpenFlowStopLossSummary'
import { one, zero } from 'helpers/zero'
import React from 'react'

interface OpenAaveStopLossInformationProps {
  stopLossLevel: BigNumber
  strategy?: IPositionTransition
}

export function OpenAaveStopLossInformation({
  strategy,
  stopLossLevel,
}: OpenAaveStopLossInformationProps) {
  const debt = amountFromWei(
    strategy?.simulation.position.debt.amount || zero,
    strategy?.simulation.position.debt.precision,
  )

  const lockedCollateral = amountFromWei(
    strategy?.simulation.position.collateral.amount || zero,
    strategy?.simulation.position.collateral.precision,
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
    </DimmedList>
  )
}
