import type { PortfolioPositionsCountReply } from 'handlers/portfolio/types'

export const fetchPortfolioPositionsCount = async (address: string) =>
  address
    ? await fetch(`/api/positions/${address}?positionsCount`)
        .then((res) => res.json() as Promise<PortfolioPositionsCountReply>)
        .catch((err) => {
          console.error(err)
          return undefined
        })
    : undefined
