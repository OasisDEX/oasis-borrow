import axios from 'axios'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { getTokenPrice, Tickers } from 'blockchain/prices'
import { getTokenSymbolFromAddress } from 'blockchain/tokensMetadata'
import {
  AjnaPoolsTableData,
  getAjnaPoolsTableData,
} from 'features/ajna/positions/common/helpers/getAjnaPoolsTableData'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { getTokenGroup } from 'handlers/product-hub/helpers/getTokenGroup'
import { ProductHubHandlerResponse } from 'handlers/product-hub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'

export default async function (): ProductHubHandlerResponse {
  const networkId = NetworkIds.GOERLI
  const supportedPairs = Object.keys(getNetworkContracts(networkId).ajnaPoolPairs)
  const tokens = uniq(supportedPairs.flatMap((pair) => pair.split('-')))
  const tickers = (await axios.get<Tickers>('/api/tokensPrices')).data
  const prices = tokens.reduce<{ [key: string]: BigNumber }>(
    (v, token) => ({ ...v, [token]: new BigNumber(getTokenPrice(token, tickers)) }),
    {},
  )

  const r = (await getAjnaPoolsTableData())
    .reduce<{ pair: [string, string]; pool: AjnaPoolsTableData }[]>((v, pool) => {
      try {
        return [
          ...v,
          {
            pair: [
              getTokenSymbolFromAddress(networkId, pool.collateralAddress),
              getTokenSymbolFromAddress(networkId, pool.quoteTokenAddress),
            ],
            pool,
          },
        ]
      } catch (e) {
        console.warn('Token address not found within context', e)

        return v
      }
    }, [])
    .filter(({ pair: [collateralToken, quoteToken] }) =>
      supportedPairs.includes(`${collateralToken}-${quoteToken}`),
    )
    .reduce<ProductHubItem[]>(
      (v, { pair: [collateralToken, quoteToken], pool: { lowestUtilizedPrice } }) => {
        const collateralPrice = prices[collateralToken]
        const quotePrice = prices[quoteToken]
        const marketPrice = collateralPrice.div(quotePrice)
        const maxLtv = formatDecimalAsPercent(lowestUtilizedPrice.div(marketPrice))

        return [
          ...v,
          {
            label: `${collateralToken}/${quoteToken}`,
            network: NetworkNames.ethereumMainnet,
            primaryToken: collateralToken,
            ...getTokenGroup(collateralToken, 'primary'),
            product: [ProductHubProductType.Borrow, ProductHubProductType.Multiply],
            protocol: LendingProtocol.Ajna,
            secondaryToken: quoteToken,
            ...getTokenGroup(quoteToken, 'secondary'),
            maxLtv,
          },
          {
            label: `${collateralToken}/${quoteToken}`,
            network: NetworkNames.ethereumMainnet,
            primaryToken: quoteToken,
            ...getTokenGroup(quoteToken, 'primary'),
            product: [ProductHubProductType.Earn],
            protocol: LendingProtocol.Ajna,
            secondaryToken: collateralToken,
            ...getTokenGroup(collateralToken, 'secondary'),
          },
        ]
      },
      [],
    )

  return r
}
