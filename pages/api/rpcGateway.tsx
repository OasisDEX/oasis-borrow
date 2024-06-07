import { NetworkNames } from 'blockchain/networks'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { AppConfigType } from 'types/config'

/**
 * Resolves the RPC node for the given network.
 * @param network - The name of the network.
 * @param rpcConfig - The RPC config.
 * @returns The RPC node URL or undefined if the network is not supported.
 */
export function resolveRpcGatewayUrl(
  network: NetworkNames,
  rpcConfig: AppConfigType['rpcConfig'],
  rpcBase: string,
): string {
  const supportedNetworks = Object.values(NetworkNames)
  if (!supportedNetworks.includes(network)) {
    console.error(`Network: ${network} is not supported. Returning BadRequest`)
    throw new Error('Network is not supported')
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
 * Retrieves the RPC gateway URL for the specified network.
 * @param networkName - The name of the network.
 * @returns The RPC gateway URL.
 */
export async function getRpcGatewayUrl(networkName: NetworkNames) {
  const appConfig = await getRemoteConfigWithCache(1000 * configCacheTime.backend)
  const rpcBase = getRpcGatewayBaseUrl()
  const rpcGatewayUrl = resolveRpcGatewayUrl(networkName, appConfig.rpcConfig, rpcBase)
  return rpcGatewayUrl
}

/**
 * Retrieves the base URL for the RPC gateway.
 * @returns The base URL for the RPC gateway.
 * @throws If the RPC Gateway URL is not defined.
 */
export function getRpcGatewayBaseUrl() {
  const rpcGatewayUrl = process.env.RPC_GATEWAY

  if (!rpcGatewayUrl) {
    console.warn('RPC Gateway URL is not defined')
  }

  const rpcBase = `${rpcGatewayUrl}`
  return rpcBase
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
  const networkName = networkQuery.toString() as NetworkNames
  const rpcGatewayUrl = await getRpcGatewayUrl(networkName)
  if (!rpcGatewayUrl) {
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
  const request = new Request(rpcGatewayUrl, {
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
