import type { Wallet } from 'features/web3OnBoard/useConnection'
import type { getRaysDailyChallengeData } from 'helpers/dailyRays'

export interface RaysDailyChallengeResponse
  extends Partial<ReturnType<typeof getRaysDailyChallengeData>> {
  message?: string
  loaded: boolean
  alreadyClaimed?: boolean
  isSignatureValid?: boolean
}

export const getDailyRaysBaseData = ({
  walletAddress,
  callback,
}: {
  walletAddress: string
  callback: (data: RaysDailyChallengeResponse) => void
}) =>
  walletAddress &&
  fetch(`/api/daily-challenge?walletAddress=${walletAddress}`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then(callback)

export const updateDailyRaysData = ({
  wallet,
  signature,
  callback,
}: {
  wallet: Wallet
  signature: string
  callback: (data: RaysDailyChallengeResponse) => void
}) =>
  wallet?.address &&
  wallet?.chainId &&
  signature &&
  fetch('/api/daily-challenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: wallet?.address,
      signature,
      chainId: wallet?.chainId,
    }),
  })
    .then((res) => res.json())
    .then(callback)
