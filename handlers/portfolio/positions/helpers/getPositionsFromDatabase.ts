import { prisma } from 'server/prisma'

interface GetPositionsFromDatabaseParams {
  address: string
}

export async function getPositionsFromDatabase({ address }: GetPositionsFromDatabaseParams) {
  const apiVaults = await prisma.vault.findMany({
    where: {
      owner_address: address,
    },
  })

  return apiVaults
}
