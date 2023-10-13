import type { NextApiHandler } from 'next'
import NodeCache from 'node-cache'
import type { DefaultErrorResponse } from 'pages/api/types'
import { config } from 'server/config'
import * as z from 'zod'

import type { PortfolioBalanceResponse, ProtocolAsset, WalletAsset } from './types'

const SUPPORTED_CHAIN_IDS = ['eth', 'op', 'arb', 'base']

const serviceUrl = 'https://pro-openapi.debank.com/v1'
const CACHE_TTL = 10

const cache = new NodeCache({ stdTTL: CACHE_TTL })

const paramsSchema = z.object({
  address: z.string(),
})

const handler: NextApiHandler<PortfolioBalanceResponse | DefaultErrorResponse> = async (
  req,
  res,
) => {
  const { debankApiKey } = config
  const debankAuthHeaderKey = 'AccessKey'
  const headers = { [debankAuthHeaderKey]: debankApiKey }

  // validate its get request
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // validate the query
  try {
    paramsSchema.parse(req.query)
  } catch (error) {
    const message = (error as z.ZodError).message || error?.toString() || 'Invalid params'
    return res.status(400).json({ message })
  }

  const { address } = req.query as z.infer<typeof paramsSchema>

  const walletAssetsCacheKey = `walletAssets-${address}`
  const protocolAssetsCacheKey = `protocolAssets-${address}`

  try {
    // fetch for wallet assets on supported chains
    let walletAssetsUsdValue: number | undefined = cache.get(walletAssetsCacheKey)
    if (walletAssetsUsdValue === undefined) {
      walletAssetsUsdValue = await getWalletAssetsUsdValue(address, headers)
    }

    // fetch for supported protocol assets on supported chains
    let protocolAssets: ProtocolAsset[] | undefined = cache.get(protocolAssetsCacheKey)
    if (protocolAssets === undefined) {
      protocolAssets = await getProtocolAssets(address, headers)
    }

    const protocolAssetsUsdValue: number = protocolAssets.reduce(
      (acc, { net_usd_value }) => acc + net_usd_value,
      0,
    )

    const totalAssetsUsdValue: number = walletAssetsUsdValue + protocolAssetsUsdValue

    const sortedProtocolAssets: ProtocolAsset[] = [...protocolAssets].sort(
      (a, b) => b.net_usd_value - a.net_usd_value,
    )

    res.setHeader('Cache-Control', `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=119`)

    return res.status(200).json({
      walletAssetsUsdValue,
      protocolAssetsUsdValue,
      totalAssetsUsdValue,
      protocolAssets: sortedProtocolAssets,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
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
  cache.set(`walletAssets-${address}`, walletAssetsUsdValue, CACHE_TTL)
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
  cache.set(`protocolAssets-${address}`, protocolAssets, CACHE_TTL)
  return protocolAssets
}

export default handler
