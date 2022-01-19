import { getToken } from 'blockchain/tokensMetadata'
import { Unbox } from 'helpers/types'
import keyBy from 'lodash/keyBy'

export const ASSETS_PAGES = [
  {
    slug: 'eth',
    header: 'Ethereum',
    symbol: 'ETH',
    icon: getToken('ETH').iconCircle,
    descriptionKey: 'assets.eth.description',
    link: 'assets.eth.link',
  },
  {
    slug: 'btc',
    header: 'Bitcoin',
    symbol: 'BTC',
    icon: getToken('WBTC').icon,
    descriptionKey: 'assets.btc.description',
    link: 'assets.btc.link',
  },
]

export const assetsPageContentBySlug = keyBy(ASSETS_PAGES, 'slug')

export type AssetPageContent = Unbox<typeof ASSETS_PAGES>
