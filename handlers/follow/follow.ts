import { PrismaClient, UsersWhoFollowVaults } from '@prisma/client'

export async function selectVaultsFollowedByAddress(
  prisma: PrismaClient,
  { address }: { address: string },
): Promise<UsersWhoFollowVaults[] | undefined> {
  const results = await prisma.usersWhoFollowVaults.findMany({
    where: { user_address: address },
  })

  console.log('results', results)
  return results
}
