import { PrismaClient, TosApproval } from '@prisma/client'

export async function selecTosForAddress(
  prisma: PrismaClient,
  { address }: { address: string },
): Promise<TosApproval[] | undefined> {
  const results = await prisma.tosApproval.findMany({
    where: { address },
    orderBy: { sign_date: 'desc' },
  })

  return results
}

export async function selectTosVersionForAddress(
  prisma: PrismaClient,
  { address, version }: { address: string; version: string },
): Promise<TosApproval | null> {
  return await prisma.tosApproval.findUnique({
    where: { tos_approval_unique_signature: { address, doc_version: version } },
  })
}
