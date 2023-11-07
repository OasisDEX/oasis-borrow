/* eslint-disable no-relative-import-paths/no-relative-import-paths */
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

import { getDefaultErrorMessage } from '../shared/helpers'
import { ResponseBadRequest, ResponseInternalServerError, ResponseOk } from '../shared/responses'
import { getAddressFromRequest } from '../shared/validators'
import { DebankSimpleProtocol } from '../shared/debank-types'
import { PortfolioOverviewResponse } from '../shared/domain-types'
import { SUPPORTED_CHAIN_IDS, SUPPORTED_PROTOCOL_IDS } from '../shared/debank-helpers'

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

  try {
    // fetch for supported protocol assets on supported chains
    const protocolAssets: DebankSimpleProtocol[] | undefined = await getProtocolAssets(
      address,
      headers,
    )

    const suppliedUsdValue: number = protocolAssets.reduce(
      (acc, { asset_usd_value }) => acc + asset_usd_value,
      0,
    )

    const borrowedUsdValue: number = protocolAssets.reduce(
      (acc, { debt_usd_value }) => acc + debt_usd_value,
      0,
    )

    const summerUsdValue: number = protocolAssets.reduce(
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
      // protocolAssets,
    }
    return ResponseOk<PortfolioOverviewResponse>({ body })
  } catch (error) {
    console.error(error)
    return ResponseInternalServerError()
  }
}

const getProtocolAssets = async (
  address: string,
  headers: Record<string, string>,
): Promise<DebankSimpleProtocol[]> => {
  const protocolAssets = await fetch(
    `${serviceUrl}/v1/user/all_simple_protocol_list?id=${address}&chain_ids=${SUPPORTED_CHAIN_IDS.toString()}`,
    { headers },
  )
    .then((_res) => _res.json() as Promise<DebankSimpleProtocol[]>)
    .then((res) => res.filter(({ id }) => SUPPORTED_PROTOCOL_IDS.includes(id)))
    .catch((error) => {
      console.error(error)
      throw new Error('Failed to fetch wallet assets')
    })
  return protocolAssets
}

export default handler
