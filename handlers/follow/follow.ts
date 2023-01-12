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
  user_address: z.string(),
  vault_id: z.number(),
  tos_doc_version: z.string(),
  vault_chain_id: z.number(),
})

export async function follow(req: NextApiRequest, res: NextApiResponse) {
  const {
    user_address,
    vault_id,
    tos_doc_version,
    vault_chain_id,
  } = usersWhoFollowVaultsSchema.parse(req.body)

  const usersAddressWhoJustFollowedVaultLowercased = user_address.toLocaleLowerCase()
  const userWhoFollowsVaultData = {
    user_address: usersAddressWhoJustFollowedVaultLowercased,
    vault_id,
    tos_doc_version,
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

export async function unfollow(req: NextApiRequest, res: NextApiResponse) {
  const {
    user_address,
    vault_id,
    // tos_doc_version,
    vault_chain_id,
  } = usersWhoFollowVaultsSchema.parse(req.body)

  const usersAddressWhoJustUnfollowedVaultLowercased = user_address.toLocaleLowerCase()

  await prisma.usersWhoFollowVaults.deleteMany({
    where: {
      user_address: usersAddressWhoJustUnfollowedVaultLowercased,
      vault_id,
      vault_chain_id,
    },
  })

  const allVaultsFollowedByUser = await prisma.usersWhoFollowVaults.findMany({
    where: { user_address: usersAddressWhoJustUnfollowedVaultLowercased },
  })

  return res.status(200).json(allVaultsFollowedByUser)
}
