import type { Wallet } from 'features/web3OnBoard/useConnection'
import type { getRaysDailyChallengeData } from 'helpers/dailyRays'

export interface RaysDailyChallengeResponse
  extends Partial<ReturnType<typeof getRaysDailyChallengeData>> {
  message?: string
  loaded: boolean
  alreadyClaimed?: boolean
  isJwtValid?: boolean
}

export const getDailyRaysBaseData = ({
  walletAddress,
  callback,
}: {
  walletAddress: string
  callback: (data: RaysDailyChallengeResponse) => void
}) =>
  walletAddress &&
  fetch(`/api/daily-challenge-user-data?walletAddress=${walletAddress}`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then(callback)

export const updateDailyRaysData = ({
  wallet,
  token,
  callback,
}: {
  wallet: Wallet
  token: string
  callback: (data: RaysDailyChallengeResponse) => void
}) =>
  wallet?.address &&
  wallet?.chainId &&
  fetch('/api/daily-challenge-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      address: wallet?.address,
      chainId: wallet?.chainId,
    }),
  })
    .then((res) => res.json())
    .then(callback)
    .catch(() => callback({ loaded: true, isJwtValid: false }))
