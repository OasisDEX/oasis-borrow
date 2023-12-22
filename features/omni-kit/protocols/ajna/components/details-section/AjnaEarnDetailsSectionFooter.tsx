import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import {
  AjnaContentFooterEarnManage,
  AjnaContentFooterEarnOpen,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

interface AjnaEarnDetailsSectionFooterProps {
  afterAvailableToWithdraw?: BigNumber
  availableToWithdraw: BigNumber
  collateralToken: string
  isOpening: boolean
  isOracless: boolean
  isSimulationLoading?: boolean
  networkId: OmniSupportedNetworkIds
  owner: string
  position: AjnaEarnPosition
  quotePrice: BigNumber
  quoteToken: string
}

export const AjnaEarnDetailsSectionFooter: FC<AjnaEarnDetailsSectionFooterProps> = ({
  availableToWithdraw,
  collateralToken,
  isOpening,
  isOracless,
  isSimulationLoading,
  networkId,
  owner,
  position,
  quotePrice,
  quoteToken,
  afterAvailableToWithdraw,
}) => {
  return (
    <>
      {isOpening ? (
        <AjnaContentFooterEarnOpen
          isOracless={isOracless}
          position={position}
          quotePrice={quotePrice}
          quoteToken={quoteToken}
        />
      ) : (
        <AjnaContentFooterEarnManage
          afterAvailableToWithdraw={afterAvailableToWithdraw}
          availableToWithdraw={availableToWithdraw}
          collateralToken={collateralToken}
          isOracless={isOracless}
          isSimulationLoading={isSimulationLoading}
          networkId={networkId}
          owner={owner}
          position={position}
          // TODO adjust once data available in subgraph
          projectedAnnualReward={zero}
          quoteToken={quoteToken}
        />
      )}
    </>
  )
}
