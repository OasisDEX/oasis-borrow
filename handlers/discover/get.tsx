import { getDiscoveryData } from 'handlers/discover/getDiscoveryData'
import { NextApiRequest, NextApiResponse } from 'next'

// type DiscoverResponse = {
//   activity?: DiscoverTableRowData['activity']
//   collateralType: string
//   collateralValue?: number
//   collRatio?: number
//   liquidationPrice?: number
//   liquidationValue?: number
//   netValue?: number
//   pnl?: number
//   positionId: string
//   protocolId: string
//   status?: DiscoverTableRowData['status']
//   vaultDebt?: number
//   vaultMultiple?: number
//   yield_30d?: number
// }

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const response = await getDiscoveryData(req.query)

  return res.status(response.error ? 500 : 200).json(response)
}
