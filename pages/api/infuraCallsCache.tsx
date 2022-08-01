import { withSentry } from '@sentry/nextjs'
import { BatchManager } from 'helpers/api/BatchManager'
import { NextApiRequest, NextApiResponse } from 'next'
import NodeCache from 'node-cache'

import { networksById } from '../../blockchain/config'
import { Request } from '../../helpers/api/BatchManager'

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

const cache = new NodeCache({ stdTTL: 15 })

async function infuraCallsCacheHandler(req: NextApiRequest, res: NextApiResponse) {
  const encodedBatchCallData = req.body.encoded

  const infuraUrl = networksById[req.body.network.chainId].infuraUrl
  const batchCallData: Array<Request> = JSON.parse(encodedBatchCallData)

  const batchManager = new BatchManager(infuraUrl, cache, { debug: true })
  const batchResults = await batchManager.batchCall(batchCallData)

  return respond(req, res, batchResults)
}

export default withSentry(infuraCallsCacheHandler)
