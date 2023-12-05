import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import {
  AjnaContentFooterEarnManage,
  AjnaContentFooterEarnOpen,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { zero } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

interface AjnaEarnDetailsSectionFooterProps {
  availableToWithdraw: BigNumber
  collateralToken: string
  isOpening: boolean
  isOracless: boolean
  isSimulationLoading?: boolean
  owner: string
  position: AjnaEarnPosition
  quotePrice: BigNumber
  quoteToken: string
  afterAvailableToWithdraw?: BigNumber
}

export const AjnaEarnDetailsSectionFooter: FC<AjnaEarnDetailsSectionFooterProps> = ({
  availableToWithdraw,
  collateralToken,
  isOpening,
  isOracless,
  isSimulationLoading,
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
          position={position}
          isSimulationLoading={isSimulationLoading}
          collateralToken={collateralToken}
          quoteToken={quoteToken}
          owner={owner}
          availableToWithdraw={availableToWithdraw}
          // TODO adjust once data available in subgraph
          projectedAnnualReward={zero}
          afterAvailableToWithdraw={afterAvailableToWithdraw}
          isOracless={isOracless}
        />
      )}
    </>
  )
}
