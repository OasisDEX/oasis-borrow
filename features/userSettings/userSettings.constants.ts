import BigNumber from 'bignumber.js'

export const SLIPPAGE_DEFAULT = new BigNumber(0.005)
const SLIPPAGE_LOW = new BigNumber(0.005)
const SLIPPAGE_MEDIUM = new BigNumber(0.01)
const SLIPPAGE_HIGH = new BigNumber(0.02)
export const SLIPPAGE_WARNING_THRESHOLD = new BigNumber(0.05)
export const SLIPPAGE_LIMIT_MAX = new BigNumber(0.2)
export const SLIPPAGE_LIMIT_MIN = new BigNumber(0.001)

export const SLIPPAGE_OPTIONS = [SLIPPAGE_LOW, SLIPPAGE_MEDIUM, SLIPPAGE_HIGH]
