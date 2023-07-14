import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface AjnaClaimedReward {
  id: number
  user: string
  week: number
  amount: number
}

type GetAjnaRewards = (walletAddress: string) => Promise<AjnaClaimedReward[]>

export const getAjnaRewards: GetAjnaRewards = async (walletAddress: string) => {
  const { response } = await loadSubgraph('Ajna', 'getClaimedRewards', {
    walletAddress: walletAddress.toLowerCase(),
  })

  if (response && 'claimeds' in response) {
    return response.claimeds
  }

  throw new Error('No claimed rewards data found')
}
