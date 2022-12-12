import { PrismaClient, UsersWhoFollowVaults } from '@prisma/client'

export async function selectVaultsFollowedByAddress(
  prisma: PrismaClient,
  { address }: { address: string },
): Promise<UsersWhoFollowVaults[] | undefined> {
  // TODO why is wrong with this query
  // const results = await prisma.usersWhoFollowVaults.findMany({
  //   where: { user_address: address },
  // })

  const results = await prisma.usersWhoFollowVaults.findMany({
    where: { user_address: { equals: address.toLocaleLowerCase() } },
  })

  console.log('results', results)
  return results
}
