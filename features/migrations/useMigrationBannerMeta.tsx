import { useMigrationsClient } from 'features/migrations/migrationsClient'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useEffect, useState } from 'react'

/**
 * Should generate the biggest position link
 * @returns string
 */
export const useMigrationBannerMeta = ({ address }: { address: string | undefined }) => {
  const { fetchMigrationPositions } = useMigrationsClient()

  const [positionToMigrate, setPositionToMigrate] = useState<PortfolioPosition | undefined | null>(
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
        setPositionToMigrate(null)
        return
      }
      setPositionToMigrate(positions[0])
      setMigrationsCount(positions.length)
    }

    void fetchBiggestPosition()
  }, [fetchMigrationPositions, address])

  const portfolioLink = `${INTERNAL_LINKS.portfolio}/${address}`

  return {
    link: migrationsCount > 1 ? portfolioLink : positionToMigrate?.url || portfolioLink,
    migrationsCount,
  }
}
