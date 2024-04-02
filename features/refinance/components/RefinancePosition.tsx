import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { RefinancePositionView } from 'features/refinance/components/RefinancePositionView'
import { useRefinanceContext } from 'features/refinance/RefinanceContext'
import { RefinancePositionViewType } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const RefinancePosition = () => {
  const { positionId } = useRefinanceContext()

  return (
    <RefinancePositionView
      type={RefinancePositionViewType.CURRENT}
      positionId={positionId.id}
      primaryToken="ETH"
      secondaryToken="DAI"
      protocolData={{
        network: NetworkNames.ethereumMainnet,
        protocol: LendingProtocol.Maker,
      }}
      poolData={{
        maxLtv: new BigNumber(0.7),
        borrowRate: new BigNumber(0.0125),
      }}
      positionData={{
        ltv: new BigNumber(0.6),
        liquidationPrice: new BigNumber(743.34),
        collateral: new BigNumber(30),
        debt: new BigNumber(12000),
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
