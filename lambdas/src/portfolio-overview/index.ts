/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
const https = require('https')

import { BadRequestResponse, InternalServerErrorResponse, OkResponse } from '../common/responses.js'
import type { ProtocolAsset, WalletAsset } from './types.js'

const SUPPORTED_CHAIN_IDS = ['eth', 'op', 'arb', 'base']

const {
  DEBANK_API_KEY: debankApiKey,
  DEBANK_API_URL: serviceUrl = 'https://pro-openapi.debank.com/v1',
} = process.env

if (!debankApiKey) {
  throw new Error('Missing DEBANK_API_KEY')
}
if (!serviceUrl) {
  throw new Error('Missing DEBANK_API_URL')
}

const debankAuthHeaderKey = 'AccessKey'
const headers = { [debankAuthHeaderKey]: debankApiKey }

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  let address: string | undefined

  // validate the query
  const query = event.queryStringParameters
  if (query != null) {
    if (query['address'] && typeof query['address'] === 'string') {
      address = query['address']
    }
  }
  if (address === undefined) {
    return BadRequestResponse('Missing address query parameter')
  }

  try {
    // fetch for wallet assets on supported chains
    const walletBalanceUsdValue: number | undefined = await getWalletAssetsUsdValue(
      address,
      headers,
    )

    // fetch for supported protocol assets on supported chains
    const protocolAssets: ProtocolAsset[] | undefined = await getProtocolAssets(address, headers)

    const suppliedUsdValue: number = protocolAssets.reduce(
      (acc, { net_usd_value }) => acc + net_usd_value,
      0,
    )

    const borrowedUsdValue: number = walletBalanceUsdValue + suppliedUsdValue

    const json = {
      walletBalanceUsdValue,
      suppliedUsdValue,
      borrowedUsdValue,
    }
    return OkResponse(json)
  } catch (error) {
    console.error(error)
    return InternalServerErrorResponse()
  }
}

const getWalletAssetsUsdValue = async (
  address: string,
  headers: Record<string, string>,
): Promise<number> => {
  const results = await Promise.all(
    SUPPORTED_CHAIN_IDS.map((chainId) =>
      https(`${serviceUrl}/user/chain_balance?id=${address}&chain_id=${chainId}`, {
        headers,
      }).then((_res) => _res.json() as Promise<WalletAsset>),
    ),
  )
  const walletAssetsUsdValue = results.reduce((acc, cur) => {
    acc = acc + cur.usd_value
    return acc
  }, 0)
  return walletAssetsUsdValue
}

const getProtocolAssets = async (
  address: string,
  headers: Record<string, string>,
): Promise<ProtocolAsset[]> => {
  const protocolAssets = await fetch(
    `${serviceUrl}/user/all_simple_protocol_list?id=${address}&chain_ids=${SUPPORTED_CHAIN_IDS.toString()}`,
    { headers },
  ).then((_res) => _res.json() as Promise<ProtocolAsset[]>)
  return protocolAssets
}

export default handler
