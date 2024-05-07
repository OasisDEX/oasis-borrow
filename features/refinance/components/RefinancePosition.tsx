import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { RefinancePositionView } from 'features/refinance/components/RefinancePositionView'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinancePositionViewType, RefinanceSidebarStep } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

export const RefinancePosition = () => {
  const {
    position: { positionId, liquidationPrice, debtTokenData, collateralTokenData, ltv, netApy },
    poolData: { maxLtv },
    tx: { isTxSuccess },
    steps: { currentStep },
    automations,
  } = useRefinanceContext()

  if (isTxSuccess && currentStep === RefinanceSidebarStep.Changes) {
    return (
      <RefinancePositionView
        type={RefinancePositionViewType.CLOSED}
        positionId={positionId.id}
        primaryToken={collateralTokenData.token.symbol}
        secondaryToken={debtTokenData.token.symbol}
      />
    )
  }

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
        borrowRate: new BigNumber(netApy),
      }}
      positionData={{
        ltv: new BigNumber(ltv.loanToValue),
        liquidationPrice: new BigNumber(liquidationPrice),
        collateral: new BigNumber(collateralTokenData.amount),
        debt: new BigNumber(debtTokenData.amount),
      }}
      automations={automations}
    />
  )
}
