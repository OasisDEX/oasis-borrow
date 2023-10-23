import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { negativeToZero } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { ContentFooterItemsEarnManage } from 'features/ajna/positions/earn/components/ContentFooterItemsEarnManage'
import { ContentFooterItemsEarnOpen } from 'features/ajna/positions/earn/components/ContentFooterItemsEarnOpen'
import type { OmniFlow } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

interface AjnaOmniEarnDetailsSectionFooterProps {
  flow: OmniFlow
  quoteToken: string
  isOracless: boolean
  position: AjnaEarnPosition
  simulation?: AjnaEarnPosition
  isSimulationLoading?: boolean
  quotePrice: BigNumber
  collateralToken: string
  owner: string
  availableToWithdraw: BigNumber
  depositAmount?: BigNumber
  withdrawAmount?: BigNumber
}

export const AjnaOmniEarnDetailsSectionFooter: FC<AjnaOmniEarnDetailsSectionFooterProps> = ({
  flow,
  quoteToken,
  isOracless,
  position,
  simulation,
  isSimulationLoading,
  quotePrice,
  collateralToken,
  owner,
  availableToWithdraw,
  depositAmount,
  withdrawAmount,
}) => {
  return (
    <>
      {flow === 'open' && (
        <ContentFooterItemsEarnOpen
          days={30}
          quoteToken={quoteToken}
          isOracless={isOracless}
          totalValueLockedUsd={position.pool.depositSize.times(quotePrice)}
          totalValueLocked={position.pool.depositSize}
          apy={position.pool.apr30dAverage}
        />
      )}
      {flow === 'manage' && (
        <ContentFooterItemsEarnManage
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
