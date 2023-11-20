import { usePortfolioClient } from 'helpers/clients/portfolio-client'
import { useEffect, useState } from 'react'

export const usePortfolioPositionsCount = ({ address }: { address?: string }) => {
  const portfolioClient = usePortfolioClient()
  const [amountOfPositions, setAmountOfPositions] = useState<number>()
  useEffect(() => {
    setAmountOfPositions(undefined)
  }, [address])
  useEffect(() => {
    address &&
      void portfolioClient.fetchPortfolioPositionsCount(address).then((data) => {
        setAmountOfPositions(data.positions.length)
      })
  }, [address, portfolioClient])
  return {
    amountOfPositions,
  }
}
