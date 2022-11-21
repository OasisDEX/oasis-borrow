import { Position } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import React from 'react'

import { emptyPosition } from '../helpers/emptyPosition'
import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export function AaveMultiplySimulate() {
  const newPosition = new Position(
    { amount: new BigNumber(10), denomination: 'ETH' },
    {
      amount: new BigNumber(50),
      denomination: 'ETH',
    },
    new BigNumber(1800),
    {
      dustLimit: new BigNumber(0),
      maxLoanToValue: new BigNumber(0.5),
      liquidationThreshold: new BigNumber(0.75),
    },
  )
  return (
    <AaveMultiplyPositionData
      currentPosition={emptyPosition}
      newPosition={newPosition}
      oraclePrice={new BigNumber(1800)}
    />
  )
}
