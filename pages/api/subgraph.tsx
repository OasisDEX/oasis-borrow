import { subgraphMethodsRecord, subgraphsRecord } from 'features/subgraphLoader/consts'
import request from 'graphql-request'
import { NextApiHandler, NextApiRequest } from 'next'

async function get({ req: { body } }: { req: NextApiRequest }) {
  try {
    const { subgraph, method, params } = JSON.parse(body)
    const response = await request(
      subgraphsRecord[subgraph as keyof typeof subgraphsRecord],
      subgraphMethodsRecord[method as keyof typeof subgraphMethodsRecord],
      params,
    )

    return {
      success: true,
      response,
    }
  } catch (error) {
    return {
      success: false,
      error,
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
