import { VaultType } from '@prisma/client'
import express from 'express'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { getUserFromRequest } from '../signature-auth/getUserFromRequest'
import { selectVaultByIdAndChainId } from './get'

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

  const vault = await selectVaultByIdAndChainId(vaultData)

  if (vault === null || vault.owner_address === user.address) {
    await prisma.vault.upsert({
      where: {
        vault_vault_id_chain_id_unique_constraint: {
          vault_id: vaultData.vault_id,
          chain_id: vaultData.chain_id,
        },
      },
      update: vaultData,
      create: vaultData,
    })
    return res.sendStatus(200)
  } else {
    return res.sendStatus(401)
  }
}
