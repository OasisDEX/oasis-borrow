import BigNumber from 'bignumber.js'
import { RefinancePositionView } from 'features/refinance/components/RefinancePositionView'
import { useRefinanceContext } from 'features/refinance/RefinanceContext'
import { RefinancePositionViewType, RefinanceSidebarStep } from 'features/refinance/types'
import { zero } from 'helpers/zero'
import React from 'react'

export const RefinanceSimulation = () => {
  const {
    steps: { currentStep },
    form: {
      state: { strategy },
    },
    poolData: { maxLtv: currentMaxLtv, borrowRate: currentBorrowRate },
  } = useRefinanceContext()

  if (currentStep === RefinanceSidebarStep.Option) {
    return <RefinancePositionView type={RefinancePositionViewType.EMPTY} />
  }

  if (!strategy) {
    return null
  }

  const maxLtv = strategy.maxLtv ? new BigNumber(strategy.maxLtv) : zero
  const borrowRate = strategy.fee ? new BigNumber(strategy.fee) : zero

  return [
    RefinanceSidebarStep.Dpm,
    RefinanceSidebarStep.Changes,
    RefinanceSidebarStep.Transaction,
  ].includes(currentStep) ? (
    <RefinancePositionView
      type={RefinancePositionViewType.SIMULATION}
      // positionId={new BigNumber(18604)}
      primaryToken={strategy.primaryToken}
      secondaryToken={strategy.secondaryToken}
      protocolData={{
        network: strategy.network,
        protocol: strategy.protocol,
      }}
      poolData={{
        maxLtv,
        maxLtvChange: maxLtv.minus(currentMaxLtv.loanToValue),
        borrowRate,
        borrowRateChange: borrowRate.minus(currentBorrowRate),
      }}
      positionData={{
        ltv: new BigNumber(0.6),
        liquidationPrice: new BigNumber(743.34),
        collateral: new BigNumber(30),
        debt: new BigNumber(12000),
      }}
      automations={{
        stopLoss: { enabled: false },
        autoSell: { enabled: false },
        autoBuy: { enabled: false },
        takeProfit: { enabled: false },
      }}
    />
  ) : null
}
