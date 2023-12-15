/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import { z } from 'zod'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from 'shared/helpers'
import { ResponseBadRequest, ResponseOk } from 'shared/responses'
import { DebankToken } from 'shared/debank-types'
import { NetworkNames, PortfolioWalletAsset, PortfolioAssetsResponse } from 'shared/domain-types'
import { DebankNetworkNameToOurs, DebankNetworkNames } from 'shared/debank-helpers'
import { addressSchema } from 'shared/validators'

const paramsSchema = z.object({
  address: addressSchema,
})

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
    const params = paramsSchema.parse(event.queryStringParameters)
    address = params.address
  } catch (error) {
    console.log(error)
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  const url = `${serviceUrl}/v1/user/all_token_list?id=${address}`
  const response = await fetch(url, {
    headers,
  })
    .then(async (_res) => {
      const json: DebankToken[] | undefined = (await _res.json()) as DebankToken[] | undefined
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
        (token): PortfolioWalletAsset => ({
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
