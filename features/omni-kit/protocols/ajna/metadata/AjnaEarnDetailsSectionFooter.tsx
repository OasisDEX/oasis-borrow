import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
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
  depositAmount?: BigNumber
  isOpening: boolean
  isOracless: boolean
  isSimulationLoading?: boolean
  owner: string
  position: AjnaEarnPosition
  quotePrice: BigNumber
  quoteToken: string
  simulation?: AjnaEarnPosition
  withdrawAmount?: BigNumber
}

export const AjnaEarnDetailsSectionFooter: FC<AjnaEarnDetailsSectionFooterProps> = ({
  availableToWithdraw,
  collateralToken,
  depositAmount,
  isOpening,
  isOracless,
  isSimulationLoading,
  owner,
  position,
  quotePrice,
  quoteToken,
  simulation,
  withdrawAmount,
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
          afterAvailableToWithdraw={
            simulation
              ? negativeToZero(
                  depositAmount
                    ? availableToWithdraw.plus(depositAmount)
                    : withdrawAmount
                    ? availableToWithdraw.minus(withdrawAmount)
                    : zero,
                )
              : undefined
          }
          isOracless={isOracless}
        />
      )}
    </>
  )
}
