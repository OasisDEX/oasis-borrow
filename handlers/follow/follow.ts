import { PrismaClient, UsersWhoFollowVaults } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

export async function selectVaultsFollowedByAddress(
  prisma: PrismaClient,
  { address }: { address: string },
): Promise<UsersWhoFollowVaults[] | undefined> {
  const results = await prisma.usersWhoFollowVaults.findMany({
    where: { user_address: { equals: address.toLocaleLowerCase() } },
  })

  return results
}

const usersWhoFollowVaultsSchema = z.object({
  vault_id: z.number(),
  vault_chain_id: z.number(),
})

export async function follow(req: NextApiRequest, res: NextApiResponse) {
  const { vault_id, vault_chain_id } = usersWhoFollowVaultsSchema.parse(req.body)
  console.log('jwt', req.headers.authorization)
  const user_address = req.headers.authorization
    ? JSON.parse(atob(req.headers.authorization.split('.')[1])).address
    : null
  console.log('user_address', user_address)
  if (!user_address) {
    console.log('address missing in jwt token')
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const usersAddressWhoJustFollowedVaultLowercased = user_address.toLocaleLowerCase()
  const userWhoFollowsVaultData = {
    user_address: usersAddressWhoJustFollowedVaultLowercased,
    vault_id,
    vault_chain_id,
  }

  await prisma.usersWhoFollowVaults.create({
    data: userWhoFollowsVaultData,
  })

  const allVaultsFollowedByUser = await prisma.usersWhoFollowVaults.findMany({
    where: { user_address: usersAddressWhoJustFollowedVaultLowercased },
  })

  return res.status(200).json(allVaultsFollowedByUser)
}
