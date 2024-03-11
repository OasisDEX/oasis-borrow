import type BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import React from 'react'

interface OmniCardDataNetApyParams extends OmniContentCardDataWithModal {
  netApy?: BigNumber
}

export function useOmniCardDataNetApy({
  netApy,
  modal,
}: OmniCardDataNetApyParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.net-apy.title' },
    ...(!netApy
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: formatDecimalAsPercent(netApy),
        }),
    modal,
  }
}
