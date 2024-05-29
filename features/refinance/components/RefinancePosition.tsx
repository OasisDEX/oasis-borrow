import BigNumber from 'bignumber.js'
import { getNetworkById } from 'blockchain/networks'
import { RefinancePositionView } from 'features/refinance/components/RefinancePositionView'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinancePositionViewType, RefinanceSidebarStep } from 'features/refinance/types'
import React from 'react'

export const RefinancePosition = () => {
  const {
    position: {
      positionId,
      liquidationPrice,
      debtTokenData,
      collateralTokenData,
      ltv,
      borrowRate,
      lendingProtocol,
    },
    poolData: { maxLtv },
    tx: { isTxSuccess },
    steps: { currentStep },
    automations,
    environment: { chainInfo },
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

  const network = getNetworkById(chainInfo.chainId)

  return (
    <RefinancePositionView
      type={RefinancePositionViewType.CURRENT}
      positionId={positionId.id}
      primaryToken={collateralTokenData.token.symbol}
      secondaryToken={debtTokenData.token.symbol}
      protocolData={{
        network: network.name,
        protocol: lendingProtocol,
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
      automations={automations}
    />
  )
}
