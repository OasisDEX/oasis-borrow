import express from 'express'
import { VaultType } from 'features/generalManageVault/generalManageVault'
import { selectVaultById } from 'server/database/vaultDAO'
import { prisma } from 'server/prisma'
import * as z from 'zod'


const paramsSchema = z.object({
    id: z.number(),
    // TODO: ŁW figure it out how to parse this enum smoothly
    // type: z.enum(...Object.keys(VaultType))
  })

export async function get(req: express.Request, res: express.Response) {

  const params = paramsSchema.parse(req.params)

  const vault = await selectVaultById(prisma, {
    vaultId: params.id,
  })

  if (vault==null){
    console.log('vault doesnt exist')
  }
//   TODO LW: add an updating existing vault action do it here or other method maybe ?
  else {
    
    prisma.vault.create({
      data: {
        vaultId: vault.vaultId,
        type: vault.type
      }
    })
  }


}