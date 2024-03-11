import type BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import React from 'react'

interface OmniCardDataApyParams {
  apy?: BigNumber
  isSimulationLoading?: boolean
}

export function useOmniCardDataApy({
  apy,
  isSimulationLoading,
}: OmniCardDataApyParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.apy.title' },
    ...(!apy || isSimulationLoading
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: formatDecimalAsPercent(apy),
        }),
  }
}
