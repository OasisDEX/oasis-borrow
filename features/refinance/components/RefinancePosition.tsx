import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { RefinancePositionView } from 'features/refinance/components/RefinancePositionView'
import { useRefinanceContext } from 'features/refinance/RefinanceContext'
import { RefinancePositionViewType } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const RefinancePosition = () => {
  const {
    position: { positionId, liquidationPrice, debtTokenAmount, collateralTokenAmount, ltv },
    poolData: { borrowRate, maxLtv, collateralTokenSymbol, debtTokenSymbol },
  } = useRefinanceContext()

  return (
    <RefinancePositionView
      type={RefinancePositionViewType.CURRENT}
      positionId={positionId.id}
      primaryToken={collateralTokenSymbol}
      secondaryToken={debtTokenSymbol}
      protocolData={{
        network: NetworkNames.ethereumMainnet,
        protocol: LendingProtocol.Maker,
      }}
      poolData={{
        maxLtv: new BigNumber(maxLtv),
        borrowRate: new BigNumber(borrowRate),
      }}
      positionData={{
        ltv: new BigNumber(ltv),
        liquidationPrice: new BigNumber(liquidationPrice),
        collateral: new BigNumber(collateralTokenAmount.amount),
        debt: new BigNumber(debtTokenAmount.amount),
      }}
      automations={{
        stopLoss: { enabled: true },
        autoSell: { enabled: false },
        autoBuy: { enabled: false },
        takeProfit: { enabled: false },
      }}
    />
  )
}
