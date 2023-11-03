/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from '../common/helpers'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from '../common/responses'
import { getAddressFromRequest } from '../common/validators'
import type { PortfolioOverviewResponse, ProtocolAsset, WalletAsset } from './types'

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
  // validate the query
  let address: string | undefined

  try {
    address = getAddressFromRequest(event)
  } catch (error) {
    const message = getDefaultErrorMessage(error)
    return ResponseBadRequest(message)
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

    const body: PortfolioOverviewResponse = {
      walletBalanceUsdValue,
      suppliedUsdValue,
      suppliedPercentageChange: -12,
      borrowedUsdValue,
      borrowedPercentageChange: 9,
      totalUsdValue: suppliedUsdValue + borrowedUsdValue,
      totalPercentageChange: 0,
    }
    return ResponseOk<PortfolioOverviewResponse>({ body })
  } catch (error) {
    console.error(error)
    return ResponseInternalServerError()
  }
}

const getWalletAssetsUsdValue = async (
  address: string,
  headers: Record<string, string>,
): Promise<number> => {
  const results = await Promise.all(
    SUPPORTED_CHAIN_IDS.map((chainId) =>
      fetch(`${serviceUrl}/user/chain_balance?id=${address}&chain_id=${chainId}`, {
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
