import { NetworkNames } from 'blockchain/networks'
import { getRemoteConfigWithCache } from 'helpers/config'
import { type ConfigResponseType, configCacheTime } from 'helpers/config'
import type { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'
import type { AppConfigType } from 'types/config'

const rpcGatewayUrl = getConfig()?.publicRuntimeConfig?.rpcGatewayUrl

if (!rpcGatewayUrl) {
  throw new Error('RPC Gateway URL is not defined')
}

const rpcBase = `${rpcGatewayUrl}`

/**
 * Returns the RPC node for the given network.
 * @param network - The name of the network.
 * @param rpcConfig - The RPC config.
 * @returns The RPC node URL or undefined if the network is not supported.
 */
export function getRpcNodeGateway(
  network: NetworkNames,
  rpcConfig: AppConfigType['rpcConfig'],
): string | undefined {
  const supportedNetworks = Object.values(NetworkNames)
  if (!supportedNetworks.includes(network)) {
    console.warn(`Network: ${network} is not supported. Returning BadRequest`)
    return undefined
  }
  return (
    `${rpcBase}/?` +
    `network=${network}&` +
    `skipCache=${rpcConfig.skipCache}&` +
    `skipMulticall=${rpcConfig.skipMulticall}&` +
    `skipGraph=${rpcConfig.skipGraph}&` +
    `source=${rpcConfig.source}`
  )
}

/**
 * Handles RPC requests.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @returns The resolved response from the RPC gateway.
 */
export async function rpc(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }
  const networkQuery = req.query.network

  if (!networkQuery) {
    res.status(400).send({ error: 'Missing network query' })
    return
  }
  const appConfig: ConfigResponseType = await getRemoteConfigWithCache(
    1000 * configCacheTime.backend,
  )

  const network = networkQuery.toString() as NetworkNames
  const rpcUrl = getRpcNodeGateway(network, appConfig.rpcConfig)
  if (!rpcUrl) {
    res.status(400).send({ error: 'Invalid network' })
    return
  }
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
      'Content-Length': '',
    },
  }
  if (typeof req.body !== 'string') {
    req.body = JSON.stringify(req.body)
  }
  const request = new Request(rpcUrl, {
    method: req.method,
    body: req.body,
    headers: {
      ...config.headers,
      'Content-Length': req.body.length.toString(),
    },
  })
  const response = await fetch(request)
  if (response.status !== 200) {
    return res.status(response.status).send({ error: response.statusText })
  }
  const resolvedResponse = await response.json()
  return res.status(200).send(resolvedResponse)
}

export default rpc
