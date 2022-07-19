import { Network } from '@ethersproject/networks/src.ts/types'
import { withSentry } from '@sentry/nextjs'
import crypto from 'crypto'
import { fetchJson } from 'ethers/lib/utils'
import { NextApiRequest, NextApiResponse } from 'next'
import NodeCache from 'node-cache'

import { networksById } from '../../blockchain/config'

const cache = new NodeCache({ stdTTL: 15 })

function respond(
  req: NextApiRequest,
  res: NextApiResponse,
  // @ts-ignore no-any
  response,
) {
  switch (req.method) {
    case 'POST':
      res.setHeader('Cache-Control', 'public, s-maxage=90, stale-while-revalidate=119')
      return res.status(200).json(response)
    default:
      return res.status(405).end()
  }
}

let hits = 0
let misses = 0

interface Request {
  method: any
  params: any
  network: Network
  id: number
  jsonrpc: string
}
function cacheHash(request: Request) {
  const hashString = JSON.stringify({
    method: request.method,
    params: { data: request.params[0].data, to: request.params[0].to },
    network: request.network,
  })
  const digest = crypto.createHash('sha256').update(hashString).digest('hex')

  return digest
}

async function infuraCallsCacheHandler(req: NextApiRequest, res: NextApiResponse) {
  const encodedCallsData = req.body.encoded

  const infuraUrl = networksById[req.body.network.chainId].infuraUrl
  const callsData: Array<{
    method: any
    params: any
    network: Network
    id: number
    jsonrpc: string
  }> = JSON.parse(encodedCallsData)

  const cacheCheck = callsData.map((callData, index) => {
    const fromCache = cache.get(cacheHash(callData))

    if (fromCache) {
      hits++
      console.log(`Cache hit: ${hits}. Cache miss: ${misses}`)
      return { data: fromCache, originalIndex: index, fromCache: true }
    } else {
      misses++
      console.log(`Cache hit: ${hits}. Cache miss: ${misses}`)
    }

    return { data: callData, originalIndex: index, fromCache: false }
  })

  // extract cache misses from cacheCheck
  const cacheMisses = cacheCheck.filter((call) => !call.fromCache).map((call) => call.data)

  // send remaining callsData to infura
  const infuraCallsData = JSON.stringify(cacheMisses)
  const infuraResponse = await fetchJson(infuraUrl, infuraCallsData).then((results) => {
    return results.map((result: { result?: string; error: Error } | null, index: number) => {
      if (result?.result) {
        cache.set(cacheHash(cacheMisses[index] as Request), result.result)
        return { data: result?.result }
      }
      if (result?.error) {
        return { error: new Error(result?.error.message) }
      }
      return null
    })
  })

  // return cache hits + infura results in correct order
  const reconstitutedResponse = cacheCheck.map((call) => {
    if (call.fromCache) {
      return { data: call.data }
    } else {
      return infuraResponse.shift()
    }
  })

  return respond(req, res, reconstitutedResponse)
}

export default withSentry(infuraCallsCacheHandler)
