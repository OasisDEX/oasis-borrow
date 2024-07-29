import type { RaysUserResponse } from 'features/rays/getRaysUser'
import { getRaysUser } from 'features/rays/getRaysUser'
import { useEffect, useState } from 'react'

export const useUserRays = ({
  walletAddress,
  // enabled - small hack to prevent fetching data on portfolio
  // where its provided all the way from the `[address].tsx` page
  enabled = true,
}: {
  walletAddress?: string
  enabled?: boolean
}) => {
  const [userRaysData, setUserRaysData] = useState<RaysUserResponse>()

  const refreshUserRaysData = () => {
    if (walletAddress && enabled) {
      void getRaysUser({ walletAddress }).then((data) => setUserRaysData(data))
    }
  }

  useEffect(() => {
    if (walletAddress && enabled) {
      void getRaysUser({ walletAddress }).then((data) => setUserRaysData(data))
    }
  }, [walletAddress, enabled])

  if (userRaysData?.error) {
    console.warn('Error fetching user rays data', userRaysData.error)
  }

  return { userRaysData, refreshUserRaysData }
}
