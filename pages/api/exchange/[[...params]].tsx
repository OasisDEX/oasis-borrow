import type { NextApiHandler } from 'next'
import { config } from 'server/config'
import * as z from 'zod'

const ROUTE_NAME = 'exchange'
const AUTH_HEADER_KEY = 'auth-key'

const oneInchSchema = z.object({
  apiVersion: z.string(),
  networkId: z.string(),
  route: z.string(),
})

const handler: NextApiHandler = async (req, res) => {
  const { oneInchApiKey, oneInchApiUrl } = config
  // GET apiVersion, networkId and route from the url for validation
  // first section is apiVersion, second is networkId, third is route
  const query = {
    apiVersion: req.query.params?.[0],
    networkId: req.query.params?.[1],
    route: req.query.params?.[2],
  }
  // validate the query
  try {
    oneInchSchema.parse(query)
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }
  // removing /api/1inch from the url to get the params only
  const path = req.url?.replace(`/api/${ROUTE_NAME}`, '')
  const newUrl = `${oneInchApiUrl}${path}`
  // added auth-key header to get authenticated with 1inch
  const headers = { [AUTH_HEADER_KEY]: oneInchApiKey }
  // fetch data from 1inch api
  const response = await fetch(newUrl, { headers })
  // pass the response from 1inch api to the client
  return res.status(response.status).json(await response.json())
}

export default handler
