import BigNumber from 'bignumber.js'

export const WAD_PRECISION = 18
export const RAY_PRECISION = 27
export const RAD_PRECISION = 45

export const WAD = new BigNumber(10).pow(WAD_PRECISION)
export const RAY = new BigNumber(10).pow(RAY_PRECISION)
export const RAD = new BigNumber(10).pow(RAD_PRECISION)

export const HOUR = 60 * 60
export const DAY = 24 * HOUR
export const SECONDS_PER_YEAR = 365 * DAY

export const FLASH_MINT_LIMIT_PER_TX = new BigNumber('500000000')
