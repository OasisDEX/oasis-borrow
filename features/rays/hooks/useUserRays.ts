import type { RaysUserResponse } from 'features/rays/getRaysUser'
import { getRaysUser } from 'features/rays/getRaysUser'
import { useEffect, useState } from 'react'

export const useUserRays = ({ walletAddress }: { walletAddress?: string }) => {
  const [userRaysData, setUserRaysData] = useState<RaysUserResponse>()

  useEffect(() => {
    if (walletAddress) {
      void getRaysUser({ walletAddress }).then((data) => setUserRaysData(data))
    }
  }, [walletAddress])

  if (userRaysData?.error) {
    console.warn('Error fetching user rays data', userRaysData.error)
  }

  return userRaysData
}
