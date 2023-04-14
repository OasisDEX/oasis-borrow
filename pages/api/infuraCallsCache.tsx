import { withSentry } from '@sentry/nextjs'
import { networksById } from 'blockchain/networksConfig'
import { BatchManager } from 'helpers/api/BatchManager'
import { Request } from 'helpers/api/BatchManager'
import { NextApiRequest, NextApiResponse } from 'next'
import NodeCache from 'node-cache'

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

const cache = new NodeCache({ stdTTL: 60 })

async function infuraCallsCacheHandler(req: NextApiRequest, res: NextApiResponse) {
  const encodedBatchCallData = req.body.encoded

  const rpcCallsEndpoint = networksById[req.body.network.chainId].rpcCallsEndpoint
  const batchCallData: Array<Request> = JSON.parse(encodedBatchCallData)

  const batchManager = new BatchManager(rpcCallsEndpoint, cache, { debug: true })
  const batchResults = await batchManager.batchCall(batchCallData)

  return respond(req, res, batchResults)
}

export default withSentry(infuraCallsCacheHandler)
