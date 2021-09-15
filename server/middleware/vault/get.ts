import { Vault } from '@prisma/client'
import express from 'express'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  id: z.string(),
})

export async function getVault(req: express.Request, res: express.Response) {
  const params = paramsSchema.parse(req.params)

  const vault = await selectVaultById({
    vaultId: parseInt(params.id, 10),
  })

  if (vault === undefined || vault == null) {
    return res.sendStatus(404)
  } else {
    return res.status(200).json({
      vaultId: vault.vault_id,
      type: vault.type,
    })
  }
}

export async function selectVaultById({ vaultId }: { vaultId: number }): Promise<Vault | null> {
  const result = await prisma.vault.findUnique({
    where: { vault_id: vaultId },
  })
  return result
}
