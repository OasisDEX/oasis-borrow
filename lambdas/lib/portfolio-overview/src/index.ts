/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import { z } from 'zod'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from 'shared/helpers'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from 'shared/responses'
import {
  DebankComplexProtocol,
  DebankPortfolioItemObject,
  DebankSimpleProtocol,
} from 'shared/debank-types'
import { PortfolioOverviewResponse } from 'shared/domain-types'
import { DEBANK_SUPPORTED_CHAIN_IDS } from 'shared/debank-helpers'
import { getSupportedPositions } from './utils'
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

  try {
    // fetch for supported protocol assets on supported chains
    const [allProtocolAssets, summerProtocolAssets] = await Promise.all([
      getAllProtocolAssets(serviceUrl, address, headers),
      getSummerProtocolAssets(serviceUrl, address, headers),
    ])

    const suppliedUsdValue: number = summerProtocolAssets.reduce(
      (acc, { stats: { asset_usd_value } }) => acc + asset_usd_value,
      0,
    )

    const borrowedUsdValue: number = summerProtocolAssets.reduce(
      (acc, { stats: { debt_usd_value } }) => acc + debt_usd_value,
      0,
    )

    const summerUsdValue: number = summerProtocolAssets.reduce(
      (acc, { stats: { net_usd_value } }) => acc + net_usd_value,
      0,
    )

    const allAssetsUsdValue: number = allProtocolAssets.reduce(
      (acc, { net_usd_value }) => acc + net_usd_value,
      0,
    )

    const body: PortfolioOverviewResponse = {
      suppliedUsdValue,
      suppliedPercentageChange: 0,
      borrowedUsdValue,
      borrowedPercentageChange: 0,
      summerUsdValue,
      summerPercentageChange: 0,
      allAssetsUsdValue,
    }
    return ResponseOk<PortfolioOverviewResponse>({ body })
  } catch (error) {
    console.error(error)
    return ResponseInternalServerError()
  }
}

const getAllProtocolAssets = async (
  serviceUrl: string,
  address: string,
  headers: Record<string, string>,
): Promise<DebankSimpleProtocol[]> => {
  const url = `${serviceUrl}/v1/user/all_simple_protocol_list?id=${address}&chain_ids=${DEBANK_SUPPORTED_CHAIN_IDS.toString()}`
  const protocolAssets = await fetch(url, { headers })
    .then(async (_res) => {
      const json: DebankSimpleProtocol[] | undefined = await _res.json()
      if (json == null || Array.isArray(json) === false) {
        console.log('fetching 1: ', url, { headers })
        console.log('response 1: ', JSON.stringify(json))
        throw new Error('Wrong response from proxy')
      }
      return json
    })
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch getAllProtocolAssets')
    })
  return protocolAssets || []
}

const getSummerProtocolAssets = async (
  serviceUrl: string,
  address: string,
  headers: Record<string, string>,
): Promise<DebankPortfolioItemObject[]> => {
  const url = `${serviceUrl}/v1/user/all_complex_protocol_list?id=${address}&chain_ids=${DEBANK_SUPPORTED_CHAIN_IDS.toString()}`
  const protocolAssets = await fetch(url, { headers })
    .then(async (_res) => {
      const json: DebankComplexProtocol[] | undefined = await _res.json()
      if (json == null || Array.isArray(json) === false) {
        console.log('fetching 2: ', url, { headers })
        console.log('response 2: ', JSON.stringify(json))
        throw new Error('Wrong response from the proxy')
      }

      const result = getSupportedPositions(json)

      return result
    })
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch getSummerProtocolAssets')
    })

  return protocolAssets || []
}

export default handler
