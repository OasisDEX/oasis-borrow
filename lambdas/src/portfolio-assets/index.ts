/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from '../shared/helpers'
import { ResponseBadRequest, ResponseOk } from '../shared/responses'
import { getAddressFromRequest } from '../shared/validators'
import { DebankToken } from '../shared/debank-types'
import { NetworkNames, PortfolioAsset, PortfolioAssetsResponse } from '../shared/domain-types'
import { DebankNetworkNameToOurs, DebankNetworkNames } from '../shared/debank-helpers'

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  //set envs
  const {
    DEBANK_API_KEY: debankApiKey = process.env.DEBANK_API_KEY,
    DEBANK_API_URL: serviceUrl = process.env.DEBANK_API_URL,
  } = (event.stageVariables as Record<string, string>) || {}
  if (!debankApiKey || !serviceUrl) {
    throw new Error('Missing env vars')
  }
  const debankAuthHeaderKey = 'Accesskey'
  const headers = { [debankAuthHeaderKey]: debankApiKey }

  // validate the query
  let address: string | undefined
  try {
    address = getAddressFromRequest(event)
  } catch (error) {
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  const url = `${serviceUrl}/v1/user/all_token_list?id=${address}`
  const response = await fetch(url, {
    headers,
  })
    .then(async (_res) => {
      const json: DebankToken[] | undefined = await _res.json()
      if (json == null || Array.isArray(json) === false) {
        console.log('fetching: ', url, { headers })
        console.log('response: ', JSON.stringify(json))
        throw new Error('Wrong response from the proxy')
      }
      return json
    })
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch wallet assets')
    })

  const preparedTokenData =
    response
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
      .sort((a, b) => b.balanceUSD - a.balanceUSD) ?? []

  const totalAssetsUsdValue = preparedTokenData.reduce((acc, { balanceUSD }) => acc + balanceUSD, 0)

  const walletAssetsResponse: PortfolioAssetsResponse = {
    totalAssetsUsdValue,
    totalAssetsPercentageChange: 0,
    assets: preparedTokenData,
  }

  return ResponseOk({ body: walletAssetsResponse })
}

export default handler
