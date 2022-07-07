import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

import { ethers } from 'ethers'
import NodeCache from 'node-cache'
import { networksById } from '../../blockchain/config'
import { Network } from '@ethersproject/networks/src.ts/types'

const cache = new NodeCache({ stdTTL: 10 })

function respond(
  req: NextApiRequest,
  res: NextApiResponse,
  // @ts-ignore no-any
  response,
) {
  switch (req.method) {
    case 'GET':
      res.setHeader('Cache-Control', 'public, s-maxage=90, stale-while-revalidate=119')
      return res.status(200).json(response)
    default:
      return res.status(405).end()
  }
}

const enabled = true

let hits = 0
let misses = 0

async function infuraCallsCacheHandler(req: NextApiRequest, res: NextApiResponse) {
  const encodedCallData = req.query.encoded as string
  const fromCache = cache.get(encodedCallData)

  if (enabled && fromCache) {
    hits++
    console.log(`Cache hit: ${hits}. Cache miss: ${misses}`)
    return respond(req, res, fromCache)
  }
  misses++
  console.log(`Cache hit: ${hits}. Cache miss: ${misses}`)
  const { method, params, network }: { method: any; params: any; network: Network } = JSON.parse(
    encodedCallData,
  )
  const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
    networksById[network.chainId].infuraUrl,
    network,
  )
  const response = await jsonRpcProvider.send(method, params)
  cache.set(encodedCallData, response)
  return respond(req, res, response)
}

export default withSentry(infuraCallsCacheHandler)
