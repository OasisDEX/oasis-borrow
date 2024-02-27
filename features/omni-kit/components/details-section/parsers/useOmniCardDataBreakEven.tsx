import BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { zero } from 'helpers/zero'
import React from 'react'

interface OmniCardDataBreakEvenParams {
  breakEven?: BigNumber
  isSimulationLoading?: boolean
}

export function useOmniCardDataBreakEven({
  breakEven,
  isSimulationLoading,
}: OmniCardDataBreakEvenParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.est-break-even.title' },
    ...(!breakEven || isSimulationLoading
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: breakEven.gt(zero) ? breakEven.toFixed(0, BigNumber.ROUND_UP) : '1',
        }),
  }
}
