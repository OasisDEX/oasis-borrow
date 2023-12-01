import { subgraphMethodsRecord } from 'features/subgraphLoader/consts'
import { getSubgraphUrl } from 'features/subgraphLoader/useSubgraphLoader'
import request from 'graphql-request'
import type { NextApiHandler, NextApiRequest } from 'next'

async function get({ req: { body } }: { req: NextApiRequest }) {
  try {
    const { subgraph, method, params, networkId } = JSON.parse(body)

    const subgraphUrl = await getSubgraphUrl(subgraph, networkId)

    const subgraphMethod = subgraphMethodsRecord[method as keyof typeof subgraphMethodsRecord]

    // error handling for missing subgraph url and method in dictionary
    if (!subgraphUrl) throw new Error(`Subgraph url not found for ${subgraph} on ${networkId}`)
    if (!subgraphMethod) throw new Error(`Subgraph method not found for ${method}`)
    const response = await request(subgraphUrl, subgraphMethod, params)
    return {
      success: true,
      response,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error,
    }
  }
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const response = await get({ req })
    return res.status(response.success ? 200 : 500).json(response)
  } else return res.status(405).end()
}

export default handler
