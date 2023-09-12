import { NetworkNames } from 'blockchain/networks'
import { NextApiRequest, NextApiResponse } from 'next'

const rpcBase = `${process.env.API_GATEWAY}/prod/rpc/`

export function getRpcNode(network: NetworkNames): string | undefined {
  switch (network) {
    // case 'hardhat': // hardhat does not request this one
    case NetworkNames.ethereumMainnet:
    case NetworkNames.ethereumGoerli:
    case NetworkNames.arbitrumMainnet:
    case NetworkNames.arbitrumGoerli:
    case NetworkNames.polygonMainnet:
    case NetworkNames.polygonMumbai:
    case NetworkNames.optimismMainnet:
    case NetworkNames.optimismGoerli:
      return `${rpcBase}/?network=${network}`
    default:
      console.warn(`Network: ${network} does not have defined a rpc node. Returning BadRequest`)
      return undefined
  }
}

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

  const network = networkQuery.toString() as NetworkNames
  const rpcUrl = getRpcNode(network)
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
  const request = new Request(rpcUrl!, {
    method: req.method,
    body: req.body,
    headers: {
      ...config.headers,
      'Content-Length': JSON.stringify(req.body).length.toString(),
    },
  })
  const response = await fetch(request)
  const resolvedResponse = await response.json()
  return res.status(200).send(resolvedResponse)
}

export default rpc
