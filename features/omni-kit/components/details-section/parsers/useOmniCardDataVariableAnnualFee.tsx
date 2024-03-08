import type BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import React from 'react'

interface OmniCardDataTokensValueParams {
  variableAnnualFee?: BigNumber
}

export function useOmniCardDataVariableAnnualFee({
  variableAnnualFee,
}: OmniCardDataTokensValueParams): OmniContentCardBase {
  return {
    title: { key: `omni-kit.content-card.variable-annual-fee.title` },
    ...(!variableAnnualFee
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: formatDecimalAsPercent(variableAnnualFee),
        }),
  }
}
