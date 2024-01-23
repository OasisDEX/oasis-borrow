import BigNumber from 'bignumber.js'

export const FIAT_PRECISION = 2
export const WAD_PRECISION = 18
export const NEGATIVE_WAD_PRECISION = -18
export const RAY_PRECISION = 27
export const RAD_PRECISION = 45
export const YEAR_DAYS = 365

export const CHAIN_LINK_PRECISION = 10 ** 8

export const WAD = new BigNumber(10).pow(WAD_PRECISION)
export const RAY = new BigNumber(10).pow(RAY_PRECISION)
export const RAD = new BigNumber(10).pow(RAD_PRECISION)

export const HOUR = 60 * 60
export const DAY = 24 * HOUR
export const SECONDS_PER_YEAR = YEAR_DAYS * DAY

export const HOUR_BI = new BigNumber(HOUR)
export const DAY_BI = new BigNumber(DAY)
export const SECONDS_PER_YEAR_BI = new BigNumber(SECONDS_PER_YEAR)

export const FLASH_MINT_LIMIT_PER_TX = new BigNumber('500000000')

export const DEFAULT_TOKEN_DIGITS = 18
