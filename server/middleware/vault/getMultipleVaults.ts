import express from 'express'
import { isArray } from 'lodash'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  id: z.union([z.string(), z.array(z.string())]),
})

export async function getMultipleVaults(req: express.Request, res: express.Response) {
  const { id } = paramsSchema.parse(req.query)
  const parsedIds = !isArray(id) ? [parseInt(id, 10)] : id.map((el) => parseInt(el, 10))

  const vaults = await prisma.vault.findMany({
    where: {
      vault_id: {
        in: parsedIds,
      },
    },
  })

  if (vaults === undefined || vaults == null) {
    return res.sendStatus(404)
  } else {
    return res.status(200).json({
      vaults,
    })
  }
}
