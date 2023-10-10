import type { PrismaClient, UsersWhoFollowVaults } from '@prisma/client'
import { Protocol } from '@prisma/client'
import { NetworkIds } from 'blockchain/networks'
import { LIMIT_OF_FOLLOWED_VAULTS } from 'features/follow/common/consts'
import { getUserFromRequest } from 'handlers/signature-auth/getUserFromRequest'
import type { NextApiRequest, NextApiResponse } from 'next'
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
  protocol: z.enum(['maker', 'aavev2', 'aavev3', 'ajna']),
})

function handleUnsupportedProtocol(req: NextApiRequest, res: NextApiResponse) {
  const protocolFromBody = req.body.protocol.toLowerCase()
  const supportedProtocols = Object.values(Protocol).map((value) => value.toString())
  if (!supportedProtocols.includes(protocolFromBody)) {
    return res.status(418).json({ error: `Protocol ${protocolFromBody} is not supported` })
  }
}

function handleUnsupportedNetwork(req: NextApiRequest, res: NextApiResponse) {
  const chainIdFromBody = req.body.vault_chain_id
  if (!Object.values(NetworkIds).includes(chainIdFromBody)) {
    return res.status(418).json({ error: `Chain with ID ${chainIdFromBody} is not supported` })
  }
}

export async function follow(req: NextApiRequest, res: NextApiResponse) {
  handleUnsupportedProtocol(req, res)
  handleUnsupportedNetwork(req, res)
  const { vault_id, vault_chain_id, protocol } = usersWhoFollowVaultsSchema.parse(req.body)
  const user = getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const usersAddressWhoJustFollowedVaultLowercased = user.address.toLocaleLowerCase()
  const userWhoFollowsVaultData = {
    user_address: usersAddressWhoJustFollowedVaultLowercased,
    vault_id,
    vault_chain_id,
    protocol: protocol as Protocol,
  }
  const allVaultsFollowedByUser = await prisma.usersWhoFollowVaults.findMany({
    where: { user_address: usersAddressWhoJustFollowedVaultLowercased },
  })

  if (allVaultsFollowedByUser.length < LIMIT_OF_FOLLOWED_VAULTS) {
    await prisma.usersWhoFollowVaults.create({
      data: userWhoFollowsVaultData,
    })
    allVaultsFollowedByUser.push(userWhoFollowsVaultData)

    return res.status(200).json(allVaultsFollowedByUser)
  } else {
    return res.status(422).json(allVaultsFollowedByUser)
  }
}

export async function unfollow(req: NextApiRequest, res: NextApiResponse) {
  handleUnsupportedProtocol(req, res)
  handleUnsupportedNetwork(req, res)
  const { vault_id, vault_chain_id, protocol } = usersWhoFollowVaultsSchema.parse(req.body)
  const user = getUserFromRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const usersAddressWhoJustUnfollowedVaultLowercased = user.address.toLocaleLowerCase()
  const userWhoUnfollowsVaultData = {
    user_address: usersAddressWhoJustUnfollowedVaultLowercased,
    vault_id,
    vault_chain_id,
    protocol: protocol as Protocol,
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
