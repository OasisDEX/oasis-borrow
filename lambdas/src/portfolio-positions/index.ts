/* eslint-disable no-relative-import-paths/no-relative-import-paths */

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { GraphQLClient, gql } from 'graphql-request'

import { getDefaultErrorMessage } from '../shared/helpers'
import { ResponseBadRequest, ResponseOk } from '../shared/responses'
import { getAddressFromRequest } from '../shared/validators'
import {
  PortfolioPosition,
  PortfolioPositionLambda,
  PortfolioPositionsResponse,
} from '../shared/domain-types'
import { DebankComplexProtocol, DebankPortfolioItemObject } from '../shared/debank-types'
import { SUPPORTED_CHAIN_IDS } from '../shared/debank-helpers'
// import { event } from './aaa'

const endpoint = 'https://graph.staging.summer.fi/subgraphs/name/oasis/automation'
const graphClient = new GraphQLClient(endpoint)

const document = (id: string) => gql`
  query ($id: String!) {
    triggers(where: { account: $id }) {
      id
      triggerType
      decodedDataNames
      decodedData
      owner
    }
  }
`

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const { DEBANK_API_KEY: debankApiKey, DEBANK_API_URL: serviceUrl } =
    (event.stageVariables as Record<string, string>) || {}
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
  const reqUrl = new URL(
    `${serviceUrl}/v1/user/all_complex_protocol_list?id=${address}&chain_idschain_ids=${SUPPORTED_CHAIN_IDS.toString()}`,
  )
  const protocols: DebankComplexProtocol[] = await fetch(reqUrl.toString(), {
    headers,
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch wallet assets')
    })
  console.log(JSON.stringify(protocols, null, 2))
  const positionsPerProtocolRequests = protocols
    .map(async (protocol) => {
      const { id, chain, name, logo_url, portfolio_item_list } = protocol

      const positionsPromises = portfolio_item_list.map(async (item) => {
        const triggers = await getTriggers(item)
        const { stats, position_index, detail, pool, name, proxy_detail } = item
        const positionId = triggers != null ? triggers[0][0] : position_index

        return {
          name,
          logoUrl: logo_url,
          positionId,
          protocol: id,
          network: chain,
          lendingType: name,
          triggers: triggers,
          tokens: {
            supply: detail.supply_token_list?.map((token) => ({
              symbol: token.symbol,
              amount: token.amount,
              price: token.price,
            })),
            borrow: detail.borrow_token_list?.map((token) => ({
              symbol: token.symbol,
              amount: token.amount,
              price: token.price,
            })),
          },
          netUsdValue: stats.net_usd_value,
          debtUsdValue: stats.debt_usd_value,
          assetUsdValue: stats.asset_usd_value,
          time: pool.time_at,
          proxyName: proxy_detail.project.name,
        }
      })

      const positions = await Promise.all(positionsPromises)
      return positions
    })
    .flat()

  const positionsPerProtocol: PortfolioPositionLambda[] = (
    await Promise.all(positionsPerProtocolRequests)
  ).flat()
  // console.log(JSON.stringify(positionsPerProtocol, null, 2))

  const body: PortfolioPositionsResponse = {
    positionsPerProtocol,
  }

  return ResponseOk({ body })
}

export default handler

async function getTriggers(item: DebankPortfolioItemObject) {
  if (item.proxy_detail.proxy_contract_id == null) {
    return null
  }
  const variables = {
    id: item.proxy_detail.proxy_contract_id,
  }
  const data: any = await graphClient.request(document(variables.id), variables)

  if (data.triggers.length === 0) {
    return null
  }
  const decodedDataIdIndex = data.triggers[0].decodedDataNames.indexOf('cdpId')
  const positionId = data.triggers[0].decodedData[decodedDataIdIndex]
  return [
    positionId,
    {
      triggers: data.triggers,
    },
  ]
}

const dotenv = require('dotenv')
dotenv.config({
  path: '../../../.env',
})
handler({
  queryStringParameters: {
    address: '0x0f8c58edf65cbd972d175bfe481bc16fa8deee45',
  },
  stageVariables: {
    DEBANK_API_KEY: process.env.DEBANK_API_KEY,
    DEBANK_API_URL: process.env.DEBANK_API_URL,
  },
} as Partial<APIGatewayProxyEventV2> as any)

