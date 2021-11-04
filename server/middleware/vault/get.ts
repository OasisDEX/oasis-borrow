import { Vault } from '@prisma/client'
import express from 'express'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  id: z.string(),
})

export async function getVault(req: express.Request, res: express.Response) {
  const params = paramsSchema.parse(req.params)

  const vaults = await selectVaultsById({
    vaultId: parseInt(params.id, 10),
  })

  if (vaults === undefined || vaults == null) {
    return res.sendStatus(404)
  } else {
    return res.status(200).json({
      vaults,
    })
  }
}

export async function selectVaultsById({ vaultId }: { vaultId: number }): Promise<Vault[] | null> {
  const result = await prisma.vault.findMany({
    where: { vault_id: vaultId },
  })
  return result
}

export async function selectVaultByIdAndChainId({
  vault_id,
  chain_id,
}: {
  vault_id: number
  chain_id: number
}): Promise<Vault | null> {
  const result = await prisma.vault.findUnique({
    where: { vault_vault_id_chain_id_unique_constraint: { vault_id, chain_id } },
  })
  return result
}
