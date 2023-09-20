import type { PrismaClient, WalletRisk } from '@prisma/client'

export async function selectRiskForAddress(
  prisma: PrismaClient,
  { address }: { address: string },
): Promise<WalletRisk | null> {
  return await prisma.walletRisk.findUnique({
    where: { address },
  })
}

export async function updateRiskForAddress(
  prisma: PrismaClient,
  address: string,
  isRisky: boolean,
): Promise<WalletRisk | null> {
  return await prisma.walletRisk.update({
    where: {
      address: address,
    },
    data: { is_risky: isRisky, last_check: new Date() },
  })
}

export async function createRiskForAddress(
  prisma: PrismaClient,
  address: string,
  isRisky: boolean,
): Promise<WalletRisk | null> {
  return await prisma.walletRisk.create({
    data: { address: address, is_risky: isRisky, last_check: new Date() },
  })
}
