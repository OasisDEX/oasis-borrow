import BigNumber from 'bignumber.js'

export const getMorphoCumulatives = () => async () => {
  // TODO: load cumulatives from subgraph when available
  return {
    borrowCumulativeDepositUSD: new BigNumber(0),
    borrowCumulativeFeesUSD: new BigNumber(0),
    borrowCumulativeWithdrawUSD: new BigNumber(0),
  }
}
