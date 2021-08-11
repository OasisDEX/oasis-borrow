import { PrismaClient, Vault } from '@prisma/client'
import { prisma } from 'server/prisma'
import express from 'express'
import * as z from 'zod'

const paramsSchema = z.object({
    id: z.number(),
    type: z.enum(['multiply', 'borrow'])
  })

export async function get(req: express.Request, res: express.Response) {

  const params = paramsSchema.parse(req.params)

  const vault = await selectVaultById({
    vaultId: params.id
  })

  if (vault === undefined || vault == null) {
    return res.sendStatus(404)
  } else {
    return res
    .status(200)
    .json(
      {
        vaultId: vault.vault_id,
        type: vault.type,
        proxyAddress: vault.proxy_address
      }
    )
  }
   
}

export async function selectVaultById(
    { vaultId }: { vaultId: number },
  ): Promise<Vault | null> {
    const result = await prisma.vault.findUnique({
        where: { vault_id: vaultId }
    })
    return result
  }
