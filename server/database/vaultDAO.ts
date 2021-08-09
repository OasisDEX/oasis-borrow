import { PrismaClient, Vault, VaultType } from '@prisma/client'


export async function selectVaultById(
    prisma: PrismaClient,
    { vaultId }: { vaultId: number },
  ): Promise<Vault | null> {
    const result = await prisma.vault.findUnique({
        where: { vaultId }
    })
    return result
  }