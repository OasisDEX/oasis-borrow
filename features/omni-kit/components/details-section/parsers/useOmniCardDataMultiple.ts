import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'

interface OmniCardDataMultipleParams {
  afterMultiple?: BigNumber
  multiple: BigNumber
}

export function useOmniCardDataMultiple({
  afterMultiple,
  multiple,
}: OmniCardDataMultipleParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.multiple.title' },
    value: `${multiple.toFixed(2)}x`,
    ...(afterMultiple && {
      change: [`${afterMultiple.toFixed(2)}x`],
    }),
  }
}
