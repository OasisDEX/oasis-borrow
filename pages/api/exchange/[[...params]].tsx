import { NetworkIds } from 'blockchain/networks'
import type { NextApiHandler } from 'next'
import { config } from 'server/config'
import { z } from 'zod'

const ROUTE_NAME = 'exchange'
const AUTH_HEADER_KEY = 'Authorization'

const oneInchSchema = z.object({
  apiVersion: z.string(),
  networkId: z.string(),
  route: z.string(),
})

const SUSDe = '0x9d39a5de30e57443bff2a8307a4256c8797a3497'
const sDAI = '0x83F20F44975D03b1b09e64809B757c47f942BEeA'
const connectorTokensMap: Record<string, string> = {
  [SUSDe]: sDAI,
}

const urlCreator = (
  path: string | undefined,
  queryParams: z.infer<typeof oneInchSchema>,
  basePath: string,
) => {
  if (!path) return basePath
  // query starts with /swaps, for example: swap/v4.1/1/swap?...'
  const replacedRouteName = path.replace(`/api/${ROUTE_NAME}`, '/swap')
  const url = new URL(`${basePath}${replacedRouteName}`)

  // Add connectorTokens query param to the url if the network is mainnet
  if (Number(queryParams.networkId) === NetworkIds.MAINNET) {
    const toTokenAddress = url.searchParams.get('toTokenAddress')
    const fromTokenAddress = url.searchParams.get('fromTokenAddress')
    const connectorTokens = url.searchParams.get('connectorTokens')
    // We are adding the connectorTokens query param only if it's not already present
    if (!connectorTokens) {
      const connectorsTokenParams: string[] = []
      const keyToCheck = [toTokenAddress?.toLowerCase(), fromTokenAddress?.toLowerCase()]
        .filter((key): key is string => key !== null && key !== undefined)
        .filter((key): key is keyof typeof connectorTokensMap => key in connectorTokensMap)

      for (const key of keyToCheck) {
        if (!connectorsTokenParams.includes(connectorTokensMap[key])) {
          connectorsTokenParams.push(connectorTokensMap[key])
        }
      }

      if (connectorsTokenParams.length > 0) {
        url.searchParams.set('connectorTokens', connectorsTokenParams.join(','))
      }
    }
  }

  return url.toString()
}

const handler: NextApiHandler = async (req, res) => {
  const { oneInchApiKey, oneInchApiUrl } = config
  // GET apiVersion, networkId and route from the url for validation
  // first section is apiVersion, second is networkId, third is route
  const query = {
    apiVersion: req.query.params?.[0],
    networkId: req.query.params?.[1],
    route: req.query.params?.[2],
  }

  const parseResult = oneInchSchema.safeParse(query)

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error })
  }

  const newUrl = urlCreator(req.url, parseResult.data, oneInchApiUrl)
  console.log('newUrl', newUrl)
  const headers = { [AUTH_HEADER_KEY]: 'Bearer ' + oneInchApiKey }
  // fetch data from 1inch api
  const response = await fetch(newUrl, { headers })
  // pass the response from 1inch api to the client
  res.setHeader('x-resolved-url', newUrl)
  return res.status(response.status).json(await response.json())
}

export default handler
