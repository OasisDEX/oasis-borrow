import { BigNumber } from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface AjnaUserNftsResponse {
  id: string
  currentReward: BigNumber
}

export const getAjnaUserNfts = async (walletAddress: string): Promise<AjnaUserNftsResponse[]> => {
  const { response } = await loadSubgraph('Ajna', 'getNftIds', {
    walletAddress: walletAddress.toLowerCase(),
  })

  if (response && 'nfts' in response) {
    return response.nfts.map((nft) => ({
      ...nft,
      currentReward: new BigNumber(nft.currentReward).shiftedBy(NEGATIVE_WAD_PRECISION),
    }))
  }

  throw new Error('No nfts data found')
}
