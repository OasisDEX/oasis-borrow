// equals to 1500 USDC, this is the max amount user will pay for the trigger
// to be executed, in practice it will be way way lower than thisw
import BigNumber from 'bignumber.js'

export const maxCoverage = '15000000000'
export const maxCoverageSpark = new BigNumber(1.5e21).toString()
