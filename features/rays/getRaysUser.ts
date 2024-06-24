import type { RaysEligibilityCondition, RaysUserType } from 'features/rays/types'

export interface RaysUserResponse {
  userRays?: {
    address: string
    eligiblePoints: number
    allPossiblePoints: number
    actionRequiredPoints: { dueDate: string; points: number; type: RaysEligibilityCondition }[]
    positionInLeaderboard: string
    userTypes: RaysUserType[]
  }
  error?: unknown
}

export const getRaysUser = async ({
  walletAddress,
}: {
  walletAddress: string
}): Promise<RaysUserResponse> => {
  try {
    const response = await fetch(`/api/rays?address=${walletAddress}`)

    return {
      userRays: await response.json(),
    }
  } catch (error) {
    console.error('Error fetching rays user data', error)
    return {
      error,
    }
  }
}
