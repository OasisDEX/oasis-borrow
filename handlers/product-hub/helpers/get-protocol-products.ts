import type { Protocol } from '@prisma/client'
import { prisma } from 'server/prisma'

export function getProtocolProducts(protocol: Protocol) {
  return prisma.productHubItems.findMany({
    where: {
      protocol: {
        equals: protocol,
      },
    },
  })
}
