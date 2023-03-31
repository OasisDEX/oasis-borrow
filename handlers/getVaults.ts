import { isArray } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  protocol: z.string(),
  id: z.union([z.string(), z.array(z.string())]),
})

export async function getVaults(req: NextApiRequest, res: NextApiResponse) {
  const { id, protocol } = paramsSchema.parse(req.query)

  const parsedIds = !isArray(id) ? [parseInt(id, 10)] : id.map((el) => parseInt(el, 10))

  const vaults = await prisma.vault.findMany({
    where: {
      vault_id: {
        in: parsedIds,
      },
      protocol: {
        equals: protocol,
      },
    },
  })

  if (vaults === undefined || vaults == null) {
    return res.status(404).send('Not Found')
  } else {
    return res.status(200).json({
      vaults,
    })
  }
}
