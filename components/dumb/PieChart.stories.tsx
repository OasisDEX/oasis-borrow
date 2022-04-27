import BigNumber from 'bignumber.js'
import React from 'react'
import { tokens } from 'blockchain/tokensMetadata'

import { PieChart } from './PieChart'

// eslint-disable-next-line import/no-default-export
export default {
  title: 'PieChart',
  component: PieChart
}

function tokenColor(symbol: string) {
  return tokens.find(t => t.symbol === symbol)?.color
}

export const PlainColors = () => {
  return <PieChart items={[{
    value: new BigNumber(2),
    color: tokenColor('ETH')
  },
  {
    value: new BigNumber(3),
    color: tokenColor('WBTC')
  },
  {
    value: new BigNumber(6),
    color: tokenColor('USDC')
  },
  {
    value: new BigNumber(4),
    color: tokenColor('UNI')
  },
]} />
}

