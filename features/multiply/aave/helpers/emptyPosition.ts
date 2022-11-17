import { Position } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'

export const emptyPosition = new Position(
  { amount: new BigNumber(0) },
  {
    amount: new BigNumber(0),
    denomination: 'ETH',
  },
  new BigNumber(0),
  {
    dustLimit: new BigNumber(0),
    maxLoanToValue: new BigNumber(0),
    liquidationThreshold: new BigNumber(0),
  },
)
