import type { Vault } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const paramsSchema = z.object({
  id: z.string(),
  chainId: z.string(),
  protocol: z.string(),
  tokenPair: z.string().optional(),
})

export async function getVault(req: NextApiRequest, res: NextApiResponse) {
  const params = paramsSchema.parse(req.query)

  const vault = await selectVaultByIdAndChainId({
    vault_id: parseInt(params.id, 10),
    chain_id: parseInt(params.chainId),
    protocol: params.protocol,
    token_pair: params.tokenPair || '',
  })

  if (vault === undefined || vault == null) {
    return res.status(200).json({})
  } else {
    return res.status(200).json({
      vaultId: vault.vault_id,
      type: vault.type,
      ownerAddress: vault.owner_address,
      protocol: vault.protocol,
      chainId: vault.chain_id,
      tokenPair: vault.token_pair,
    })
  }
}

export async function selectVaultByIdAndChainId({
  vault_id,
  chain_id,
  protocol,
  token_pair,
}: {
  vault_id: number
  chain_id: number
  protocol: string
  token_pair: string
}): Promise<Vault | null> {
  return prisma.vault.findUnique({
    where: {
      vault_vault_id_chain_id_protocol_token_pair_unique_constraint: {
        vault_id,
        chain_id,
        protocol,
        token_pair,
      },
    },
  })
}
