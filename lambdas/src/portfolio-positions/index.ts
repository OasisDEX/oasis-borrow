/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import dotenv from 'dotenv'
dotenv.config({
  path: '../../../.env',
})
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { GraphQLClient, gql } from 'graphql-request'

import { getDefaultErrorMessage } from '../shared/helpers'
import { ResponseBadRequest, ResponseOk } from '../shared/responses'
import { getAddressFromRequest } from '../shared/validators'
import { PortfolioPosition, PortfolioPositionsResponse } from '../shared/domain-types'
import { DebankComplexProtocol } from '../shared/debank-types'
import { SUPPORTED_CHAIN_IDS } from '../shared/debank-helpers'
// import { event } from './aaa'

const endpoint = 'https://graph.staging.summer.fi/subgraphs/name/oasis/automation'
const graphClient = new GraphQLClient(endpoint)

const query = gql`
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
  const response: DebankComplexProtocol[] = await fetch(reqUrl.toString(), {
    headers,
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch wallet assets')
    })
  // console.log(response)
  const positionsPerProtocol = response.map(async (protocol) => {
    const { id, chain, name, logo_url, tvl, portfolio_item_list } = protocol

    const triggersPerPositionId = await Promise.all(
      portfolio_item_list
        .filter((item) => item.proxy_detail.proxy_contract_id != null)
        .map(async (item) => {
          const variables = {
            id: item.proxy_detail.proxy_contract_id,
          }
          console.log(variables)
          const data: any = await graphClient.request(query, variables)
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
        })
        .filter(Boolean),
    )

    return {
      protocol: id,
      triggersPerPosition: triggersPerPositionId.flat(),
    }
  })

  const positions = await Promise.all(positionsPerProtocol)
  console.log(JSON.stringify(positions, null, 2))

  const body = {
    // positions: positionsPerProtocol.flat(),
    positions,
  }

  return ResponseOk({ body })
}

export default handler

// handler({
//   queryStringParameters: {
//     address: '0x0f8c58edf65cbd972d175bfe481bc16fa8deee45',
//   },
//   stageVariables: {
//     DEBANK_API_KEY: process.env.DEBANK_API_KEY,
//     DEBANK_API_URL: process.env.DEBANK_API_URL,
//   },
// } as Partial<APIGatewayProxyEventV2> as any)

