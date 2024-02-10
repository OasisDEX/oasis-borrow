import { getMigrationLink } from 'features/migrations/getMigrationLink'
import { useMigrationsClient } from 'features/migrations/migrationsClient'
import type { ProductHubSupportedNetworks } from 'features/productHub/types'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { useEffect, useState } from 'react'

/**
 * Should generate biggest position link
 * @returns string
 */
export const useMigrationBannerMeta = ({ address }: { address: string | undefined }) => {
  const { fetchMigrationPositions } = useMigrationsClient()

  const [biggestPosition, setBiggestPosition] = useState<PortfolioPosition | undefined | null>(
    undefined,
  )
  const [migrationsCount, setMigrationsCount] = useState<number>(0)

  // try to get the biggest position from fetchMigrationPositions
  useEffect(() => {
    const fetchBiggestPosition = async () => {
      if (!address) {
        return
      }
      const positions = await fetchMigrationPositions(address)
      if (!positions || positions.length === 0) {
        setBiggestPosition(null)
        return
      }
      setBiggestPosition(positions[0])
      setMigrationsCount(positions.length)
    }

    void fetchBiggestPosition()
  }, [fetchMigrationPositions, address])

  const link =
    biggestPosition != null && address
      ? getMigrationLink({
          network: biggestPosition.network as ProductHubSupportedNetworks,
          protocol: biggestPosition.protocol,
          address,
        })
      : undefined

  return { biggestPositionLink: link, migrationsCount }
}
