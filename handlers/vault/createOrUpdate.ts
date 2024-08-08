import type { VaultType } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

import { selectVaultByIdAndChainId } from './get'

const vaultSchema = z.object({
  id: z.number(),
  type: z.enum(['borrow', 'multiply', 'earn']),
  chainId: z.number(),
  protocol: z.string(),
  tokenPair: z.string(),
  walletAddress: z.string(),
})

export async function createOrUpdate(req: NextApiRequest, res: NextApiResponse) {
  const params = vaultSchema.parse(req.body)

  const token = req.cookies[`token-${params.walletAddress.toLowerCase()}`]

  if (!token) {
    return res.status(401).json({ authenticated: false })
  }

  const vaultData = {
    vault_id: params.id,
    type: params.type as VaultType,
    owner_address: params.walletAddress.toLowerCase(),
    chain_id: params.chainId,
    protocol: params.protocol,
    token_pair: params.tokenPair,
  }

  const insertQuery = `INSERT INTO vault (vault_id, chain_id, type, owner_address, protocol, token_pair) VALUES (${vaultData.vault_id},${vaultData.chain_id},'${vaultData.type}','${vaultData.owner_address}', '${vaultData.protocol}', '${vaultData.token_pair}')`
  const updateQuery = `UPDATE vault SET type='${vaultData.type}' WHERE vault_id=${vaultData.vault_id} AND chain_id=${vaultData.chain_id} AND protocol='${vaultData.protocol}' AND token_pair='${vaultData.token_pair}'`

  if (params.type !== 'borrow' && params.type !== 'multiply' && params.type !== 'earn') {
    return res.status(403).send('Incorrect type of vault')
  }

  const vault = await selectVaultByIdAndChainId(vaultData)

  if (vault === null || vault.owner_address === params.walletAddress.toLowerCase()) {
    if (vault === null) {
      await prisma.$executeRawUnsafe(insertQuery)
    } else {
      await prisma.$executeRawUnsafe(updateQuery)
    }
    return res.status(200).send('OK')
  } else {
    return res.status(401).send('Unauthorized')
  }
}
