/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from '../shared/helpers'
import { ResponseBadRequest, ResponseOk } from '../shared/responses'
import { getAddressFromRequest } from '../shared/validators'
import { mockPositionsResponse } from './mock'
import { PortfolioPosition, PortfolioPositionsResponse } from '../shared/domain-types'
import { DebankComplexProtocol } from '../shared/debank-types'

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
    address
  } catch (error) {
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
  }

  const reqUrl = new URL(`${serviceUrl}/v1/user/all_token_list?id=${address}&chain`)
  const response: DebankComplexProtocol[] = await fetch(reqUrl.toString(), {
    headers,
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch wallet assets')
    })

  const positionsPerProtocol = response.map((protocol): PortfolioPosition => {
    const { idchain, name, logo_url, tvl } = protocol
    return {
      name: protocol.name,
      symbol: protocol.symbol,
      network: chain,
      priceUSD: price,
      price24hChange: price_24h_change,
      balance: amount,
      balanceUSD: amount * price,
    }
  })

  const body: PortfolioPositionsResponse = {
    positions: positionsPerProtocol.flat(),
  }

  return ResponseOk({ body })
}

export default handler
