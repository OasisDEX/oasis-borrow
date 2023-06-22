import BigNumber from 'bignumber.js'

// library works with a normalised precision of 18, and is sometimes exposed in the API.
export const NORMALISED_PRECISION = new BigNumber(18)
