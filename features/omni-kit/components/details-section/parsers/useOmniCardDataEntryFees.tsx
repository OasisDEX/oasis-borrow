import type BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'

interface OmniCardDataEntryFeesParams {
  entryFees?: BigNumber
  token: string
  isSimulationLoading?: boolean
}

export function useOmniCardDataEntryFees({
  entryFees,
  token,
  isSimulationLoading,
}: OmniCardDataEntryFeesParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.est-entry-fees.title' },
    ...(!entryFees || isSimulationLoading
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: entryFees.gt(zero) ? `${formatCryptoBalance(entryFees)} ${token}` : '-',
        }),
  }
}
