import BigNumber from 'bignumber.js'
import type { OmniCloseTo } from 'features/omni-kit/types'

export const stopLossConstants = {
  sliderStep: new BigNumber(0.1).div(100), // 0.1% step
  defaultResolveTo: 'collateral' as OmniCloseTo,
  offsets: {
    open: {
      min: new BigNumber(0.01),
      max: new BigNumber(0.025),
    },
    manage: {
      min: new BigNumber(0.01),
      max: new BigNumber(0.025),
    },
  },
}
