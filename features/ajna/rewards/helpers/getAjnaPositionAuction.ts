import { BigNumber } from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface AjnaPositionAuctionResponse {
  id: string
  inLiquidation: boolean
  alreadyTaken: boolean
  endOfGracePeriod: number
  debtToCover: BigNumber
  collateral: BigNumber
}

export const getAjnaPositionAuction = async (
  dpmProxyAddress: string,
): Promise<AjnaPositionAuctionResponse[]> => {
  const { response } = await loadSubgraph('Ajna', 'getPositionAuction', {
    dpmProxyAddress: dpmProxyAddress.toLowerCase(),
  })

  if (response && 'auctions' in response) {
    return response.auctions.map((auction) => ({
      ...auction,
      endOfGracePeriod: auction.endOfGracePeriod * 1000,
      debtToCover: new BigNumber(auction.debtToCover).shiftedBy(NEGATIVE_WAD_PRECISION),
      collateral: new BigNumber(auction.collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
    }))
  }

  throw new Error('No auctions data found')
}
