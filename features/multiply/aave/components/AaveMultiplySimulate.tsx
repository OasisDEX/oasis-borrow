import BigNumber from 'bignumber.js'
import React from 'react'

import { emptyPosition } from '../helpers/emptyPosition'
import { AaveMultiplyPositionData } from './AaveMultiplyPositionData'

export function AaveMultiplySimulate() {
  return <AaveMultiplyPositionData currentPosition={emptyPosition} oraclePrice={new BigNumber(0)} />
}
