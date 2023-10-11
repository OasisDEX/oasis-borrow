import BigNumber from 'bignumber.js'

// equals to 1500 USDC, this is the max amount user will pay for the trigger
// to be executed, in practice it will be way lower than this
export const maxCoverage = '15000000000'

// Spark coverage is in DAI instead of USDC
export const maxCoverageSpark = new BigNumber(1.5e21).toString()
