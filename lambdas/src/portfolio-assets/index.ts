/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from '../shared/helpers'
import { ResponseBadRequest, ResponseOk } from '../shared/responses'
import { getAddressFromRequest } from '../shared/validators'
import { DebankToken } from '../shared/debank-types'
import { NetworkNames, PortfolioAsset, PortfolioAssetsResponse } from '../shared/domain-types'
import { DebankNetworkNameToOurs, DebankNetworkNames } from '../shared/debank-helpers'

const { DEBANK_API_KEY: debankApiKey, DEBANK_API_URL: serviceUrl } = process.env
if (!debankApiKey) {
  throw new Error('Missing DEBANK_API_KEY')
}
const debankAuthHeaderKey = 'Accesskey'
const headers = { [debankAuthHeaderKey]: debankApiKey }

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  // validate the query
  let address: string | undefined

  try {
    address = getAddressFromRequest(event)
  } catch (error) {
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  const reqUrl = new URL(`${serviceUrl}/v1/user/all_token_list?id=${address}`)
  const response: DebankToken[] = await fetch(reqUrl.toString(), {
    headers,
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch wallet assets')
    })

  const preparedTokenData = response
    .filter(({ chain, is_wallet, price }) => is_wallet && chain !== undefined && price > 0)
    .map(
      (token): PortfolioAsset => ({
        name: token.name,
        symbol: token.symbol,
        network: DebankNetworkNameToOurs[token.chain as DebankNetworkNames],
        priceUSD: token.price,
        price24hChange: token.price_24h_change,
        balance: token.amount,
        balanceUSD: token.amount * token.price,
      }),
    )
    .filter(({ network }) => Object.values(NetworkNames).includes(network))
    .sort((a, b) => b.balanceUSD - a.balanceUSD)

  const walletAssetsResponse: PortfolioAssetsResponse = {
    totalAssetsUsdValue: preparedTokenData.reduce((acc, { balanceUSD }) => acc + balanceUSD, 0),
    totalAssetsPercentageChange: 0,
    assets: preparedTokenData,
  }

  return ResponseOk({ body: walletAssetsResponse })
}

export default handler
