import { VaultType } from '@prisma/client'
import express from 'express'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { getUserFromRequest } from '../signature-auth/getUserFromRequest'
import { selectVaultById } from './get'

const vaultSchema = z.object({
  id: z.number(),
  type: z.enum(['borrow', 'multiply']),
  chainId: z.number(),
})

export async function createOrUpdate(req: express.Request, res: express.Response) {
  const params = vaultSchema.parse(req.body)
  const user = getUserFromRequest(req)

  const vaultData = {
    vault_id: params.id,
    type: params.type as VaultType,
    owner_address: user.address,
    chain_id: params.chainId,
  }
  if (params.type !== 'borrow' && params.type !== 'multiply') {
    return res.status(403).send('Incorrect type of vault')
  }

  const vault = await selectVaultById({ vaultId: params.id })

  if (vault === null || vault.owner_address === user.address) {
    await prisma.vault.upsert({
      where: {
        vault_id: params.id,
      },
      update: vaultData,
      create: vaultData,
    })
    return res.sendStatus(200)
  } else {
    return res.sendStatus(401)
  }
}
