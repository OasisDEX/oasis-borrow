import BigNumber from 'bignumber.js'

// TODO Go in some config somewhere?

export const COLLATERALIZATION_DANGER_OFFSET = new BigNumber('0.2') // 150% * 1.2 = 180%

export const COLLATERALIZATION_WARNING_OFFSET = new BigNumber('0.5') // 150% * 1.5 = 225%
