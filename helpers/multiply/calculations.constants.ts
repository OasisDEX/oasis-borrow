import BigNumber from 'bignumber.js'

export const OAZO_FEE = new BigNumber(0.002)
// Updated from 0.0004 to 0.00005 -> https://app.shortcut.com/oazo-apps/story/6168/deploy-new-fee-tier-for-guni-and-update-contract-addresses-to-use-it
export const OAZO_LOWER_FEE = new BigNumber(0.00005)
export const LOAN_FEE = new BigNumber(0)
export const SLIPPAGE = new BigNumber(0.005)
export const GUNI_MAX_SLIPPAGE = new BigNumber(0.001)
export const GUNI_SLIPPAGE = new BigNumber(0.0001)
export const STOP_LOSS_MARGIN = new BigNumber(0.02)
