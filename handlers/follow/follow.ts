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
  console.log('POST body')
  console.log(req.body)
  const {
    user_address,
    vault_id,
    tos_doc_version,
    vault_chain_id,
  } = usersWhoFollowVaultsSchema.parse(req.body)

  const usersWhoFollowVaultsData = {
    user_address,
    vault_id,
    tos_doc_version,
    vault_chain_id,
  }

  await prisma.usersWhoFollowVaults.create({
    data: usersWhoFollowVaultsData,
  })

  return res.status(200).json(usersWhoFollowVaultsData)
}
