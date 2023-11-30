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
      {isOpening && (
        <AjnaContentFooterEarnOpen
          days={30}
          quoteToken={quoteToken}
          isOracless={isOracless}
          totalValueLockedUsd={position.pool.depositSize.times(quotePrice)}
          totalValueLocked={position.pool.depositSize}
          apy={position.pool.apr30dAverage}
        />
      )}
      {!isOpening && (
        <AjnaContentFooterEarnManage
          isLoading={isSimulationLoading}
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
