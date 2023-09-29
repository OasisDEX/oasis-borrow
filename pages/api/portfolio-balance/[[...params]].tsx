import type { NextApiHandler } from 'next'
import { config } from 'server/config'
import * as z from 'zod'

import { walletAssets, protocolAssets } from './mock'

const ROUTE_NAME = 'portfolio-balance'
const AUTH_HEADER_KEY = 'AccessKey'

const oneInchSchema = z.object({
  apiVersion: z.string(),
  networkId: z.string(),
  route: z.string(),
})

const handler: NextApiHandler = async (req, res) => {
  const { debankApiKey } = config

  // // get params from the query
  // const query = {
  //   networkId: req.query.params?.[0],
  //   address: req.query.params?.[1],
  // }
  // // validate the query
  // try {
  //   oneInchSchema.parse(query)
  // } catch (error) {
  //   return res.status(400).json({ error: (error as Error).message })
  // }

  // fetch for all chains
  return res.status(200).json({
    walletAssets: walletAssets,
    protocolAssets: protocolAssets,
  })
}

export default handler
