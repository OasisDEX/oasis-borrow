import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, UsersWhoFollowVaults } from '@prisma/client'
import * as z from 'zod'

const paramsSchema = z.object({
  address: z.string(),
  vaultId: z.number(),
  chainId: z.number(),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
    const { address, vaultId, chainId } = paramsSchema.parse(req.query)
    
    return res.status(200).json({
        address,
        vaultId,
        chainId,
    })
}
