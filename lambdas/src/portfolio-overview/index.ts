/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from '../shared/helpers'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from '../shared/responses'
import { getAddressFromRequest } from '../shared/validators'
import {
  DebankComplexProtocol,
  DebankPortfolioItemObject,
  DebankSimpleProtocol,
} from '../shared/debank-types'
import { PortfolioOverviewResponse } from '../shared/domain-types'
import {
  SUPPORTED_CHAIN_IDS,
  SUPPORTED_PROTOCOL_IDS,
  SUPPORTED_PROXY_IDS,
} from '../shared/debank-helpers'

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
      (acc, { asset_usd_value }) => acc + asset_usd_value,
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
) => {
  const protocolAssets = await fetch(
    `${serviceUrl}/v1/user/all_simple_protocol_list?id=${address}&chain_ids=${SUPPORTED_CHAIN_IDS.toString()}`,
    { headers },
  )
    .then((_res) => _res.json() as Promise<DebankSimpleProtocol[]>)
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch getAllProtocolAssets')
    })
  return protocolAssets
}

const getSummerProtocolAssets = async (
  serviceUrl: string,
  address: string,
  headers: Record<string, string>,
): Promise<DebankPortfolioItemObject[]> => {
  const protocolAssets = await fetch(
    `${serviceUrl}/v1/user/all_complex_protocol_list?id=${address}&chain_ids=${SUPPORTED_CHAIN_IDS.toString()}`,
    { headers },
  )
    .then((_res) => _res.json() as Promise<DebankComplexProtocol[]>)
    .then((res) =>
      // filter out non-supported protocols
      res.filter(({ id }) => {
        const isSupportedProtocol = SUPPORTED_PROTOCOL_IDS.includes(id)
        return isSupportedProtocol
      }),
    )
    .then((res) =>
      // map each protocol to position array and flatten
      // and filter out non-supported positions
      res
        .map(({ portfolio_item_list }) =>
          (portfolio_item_list || []).filter(({ proxy_detail }) =>
            SUPPORTED_PROXY_IDS.includes(proxy_detail?.project?.id ?? ''),
          ),
        )
        .flat(),
    )
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch getSummerProtocolAssets')
    })

  return protocolAssets
}

export default handler
