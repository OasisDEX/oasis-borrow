import { PrismaClient, UsersWhoFollowVaults } from '@prisma/client'
import { getUserFromRequest } from 'handlers/signature-auth/getUserFromRequest'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/prisma'
import * as z from 'zod'

const LIMIT_OF_FOLLOWED_VAULTS = 30

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
  const user = getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const usersAddressWhoJustFollowedVaultLowercased = user.address.toLocaleLowerCase()
  const userWhoFollowsVaultData = {
    user_address: usersAddressWhoJustFollowedVaultLowercased,
    vault_id,
    vault_chain_id,
  }
  const allVaultsFollowedByUser = await prisma.usersWhoFollowVaults.findMany({
    where: { user_address: usersAddressWhoJustFollowedVaultLowercased },
  })
  if (allVaultsFollowedByUser.length <= LIMIT_OF_FOLLOWED_VAULTS) {
    await prisma.usersWhoFollowVaults.create({
      data: userWhoFollowsVaultData,
    })
    allVaultsFollowedByUser.push(userWhoFollowsVaultData)

    return res.status(200).json(allVaultsFollowedByUser)
  } else {
    return res.status(422).json({
      error:
        'You have reached the Followed Vaults limit, please unfollow vaults before continuing.',
    })
  }
}

export async function unfollow(req: NextApiRequest, res: NextApiResponse) {
  const { vault_id, vault_chain_id } = usersWhoFollowVaultsSchema.parse(req.body)
  const user = getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const usersAddressWhoJustUnfollowedVaultLowercased = user.address.toLocaleLowerCase()
  const userWhoUnfollowsVaultData = {
    user_address: usersAddressWhoJustUnfollowedVaultLowercased,
    vault_id,
    vault_chain_id,
  }
  await prisma.usersWhoFollowVaults
    .deleteMany({
      where: userWhoUnfollowsVaultData,
    })
    .then(() => {
      return res.status(200).json({ message: 'Unfollowed' })
    })
    .catch((err) => {
      return res.status(500).json({ error: err })
    })
}
