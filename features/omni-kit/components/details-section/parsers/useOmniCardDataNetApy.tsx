import { Skeleton } from 'components/Skeleton'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import type { SimulationYields } from 'features/omni-kit/hooks'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import React from 'react'

interface OmniCardDataNetApyParams extends OmniContentCardDataWithModal {
  simulations?: SimulationYields
}

export function useOmniCardDataNetApy({
  modal,
  simulations,
}: OmniCardDataNetApyParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.net-apy.title' },
    ...(!simulations?.apy
      ? {
          extra: <Skeleton width="120px" height="20px" sx={{ mt: 1 }} />,
        }
      : {
          value: formatDecimalAsPercent(simulations.apy?.div(100)),
        }),
    modal,
  }
}
