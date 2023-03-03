import { gql, request } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'
import * as z from 'zod'

const getEarnData = gql`
  query getAccount($proxy: ID!) {
    account(id: $proxy) {
      earnPositions {
        lps
        index
        nft {
          id
        }
      }
    }
  }
`

const querySchema = z.object({
  proxy: z.string(),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const ajnaSubgraphUrl = getConfig()?.publicRuntimeConfig?.ajnaSubgraphUrl
  const { proxy } = querySchema.parse(req.query)

  try {
    const response = await request(ajnaSubgraphUrl, getEarnData, { proxy })
    return res.status(200).json(response)
  } catch (error) {
    return res.status(404).json(error)
  }
}
