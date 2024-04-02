import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { RefinancePositionView } from 'features/refinance/components/RefinancePositionView'
import { useRefinanceContext } from 'features/refinance/RefinanceContext'
import { RefinancePositionViewType } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const RefinancePosition = () => {
  const {
    position: { positionId, liquidationPrice, debtTokenData, collateralTokenData, ltv },
    poolData: { borrowRate, maxLtv },
  } = useRefinanceContext()

  return (
    <RefinancePositionView
      type={RefinancePositionViewType.CURRENT}
      positionId={positionId.id}
      primaryToken={collateralTokenData.token.symbol}
      secondaryToken={debtTokenData.token.symbol}
      protocolData={{
        network: NetworkNames.ethereumMainnet,
        protocol: LendingProtocol.Maker,
      }}
      poolData={{
        maxLtv: new BigNumber(maxLtv.loanToValue),
        borrowRate: new BigNumber(borrowRate),
      }}
      positionData={{
        ltv: new BigNumber(ltv.loanToValue),
        liquidationPrice: new BigNumber(liquidationPrice),
        collateral: new BigNumber(collateralTokenData.amount),
        debt: new BigNumber(debtTokenData.amount),
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
