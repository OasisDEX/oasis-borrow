import BigNumber from 'bignumber.js'
import { tokens } from 'blockchain/tokensMetadata'
import React from 'react'

import { PieChart } from './PieChart'

// eslint-disable-next-line import/no-default-export
export default {
  title: 'PieChart',
  component: PieChart,
}

const findToken = (symbol: string) => tokens.find((t) => t.symbol === symbol)

function tokenColor(symbol: string) {
  return findToken(symbol)?.color || 'neutral70'
}

export const TokenColors = () => {
  return (
    <PieChart
      items={[
        {
          value: new BigNumber(2),
          color: tokenColor('ETH'),
        },
        {
          value: new BigNumber(3),
          color: tokenColor('WBTC'),
        },
        {
          value: new BigNumber(6),
          color: tokenColor('USDC'),
        },
        {
          value: new BigNumber(4),
          color: tokenColor('UNI'),
        },
      ]}
    />
  )
}
