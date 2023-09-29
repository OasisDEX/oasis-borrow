import type BigNumber from 'bignumber.js'
import { tokenList } from 'components/swapWidget/tokenList'
import { uniq } from 'lodash'

import type { AssetAction } from './assetActions'

export type AssetView = {
  id: string
  name: string
  value: number
  proportion: BigNumber
  logo_url?: string
  url?: string
  actions?: Array<AssetAction>
}

export type Position = {
  token: string
  title: string
  contentsUsd: BigNumber
  url: string
}

export type TopAssetsAndPositionsViewModal = {
  assetsAndPositions: Array<AssetView>
  percentageOther: BigNumber
  totalValueUsd: BigNumber
}

const tokensWeCareAbout: Array<string> = uniq(tokenList.tokens.map((t) => t.symbol.toUpperCase()))
tokensWeCareAbout.push('ETH')
