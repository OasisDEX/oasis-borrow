import BigNumber from 'bignumber.js'
import React from 'react'
import { tokens } from 'blockchain/tokensMetadata'

import { PieChart } from './PieChart'
import { InjectTokenIconsDefs } from 'theme/tokenIcons'

// eslint-disable-next-line import/no-default-export
export default {
  title: 'PieChart',
  component: PieChart
}

const findToken = (symbol: string) => tokens.find(t => t.symbol === symbol)

function tokenColor(symbol: string) {
  return findToken(symbol)?.color
}

function tokenIconBgId(symbol: string) {
  return findToken(symbol)?.iconBgId
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

export const UsingIconBackground = () => {
  return <>
    <InjectTokenIconsDefs />
    <PieChart items={[{
      value: new BigNumber(2),
      svgBgId: tokenIconBgId('ETH')
    },
    {
      value: new BigNumber(3),
      svgBgId: tokenIconBgId('WBTC')
    },
    {
      value: new BigNumber(6),
      svgBgId: tokenIconBgId('USDC')
    },
    {
      value: new BigNumber(4),
      svgBgId: tokenIconBgId('UNI')
    },
  ]} />
  </>
}

