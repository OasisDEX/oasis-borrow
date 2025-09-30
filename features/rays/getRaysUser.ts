import type { RaysEligibilityCondition, RaysUserType } from 'features/rays/types'
import { raysUserMockedResponse } from 'handlers/portfolio/positions/helpers/rays-mock'

export interface RaysUserResponse {
  userRays?: {
    address: string
    eligiblePoints: number
    allPossiblePoints: number
    dailyChallengeRays: number
    actionRequiredPoints: { dueDate: string; points: number; type: RaysEligibilityCondition }[]
    positionInLeaderboard: string
    userTypes: RaysUserType[]
  }
  error?: unknown
}

export const getRaysUser = async ({
  walletAddress: _walletAddress,
}: {
  walletAddress: string
}): Promise<RaysUserResponse> => {
  try {
    const response = await raysUserMockedResponse()

    return {
      userRays: response.userRays,
    }
  } catch (error) {
    console.error('Error fetching rays user data', error)
    return {
      error,
    }
  }
}
