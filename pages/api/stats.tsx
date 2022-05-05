import { NextApiRequest, NextApiResponse } from 'next'

const STATIC_OASIS_STATS = {
  monthlyVolume: 3900000000,
  managedOnOasis: 1440000000,
  medianVaultSize: 212000,
}

export type OasisStats = typeof STATIC_OASIS_STATS

export default async function oasisStatsHandler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(STATIC_OASIS_STATS)
}
