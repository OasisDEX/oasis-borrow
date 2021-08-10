import express from 'express'
import { PrismaClient, Vault, VaultType } from '@prisma/client'
import * as z from 'zod'


const paramsSchema = z.object({
    id: z.number(),
    type: z.enum(['multiply', 'borrow'])
  })

export async function get(req: express.Request, res: express.Response) {

  const params = paramsSchema.parse(req.params)
   
}




export async function selectVaultById(
    prisma: PrismaClient,
    { vaultId }: { vaultId: number },
  ): Promise<Vault | null> {
    const result = await prisma.vault.findUnique({
        where: { vaultId }
    })
    return result
  }