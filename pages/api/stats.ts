import { NextApiRequest, NextApiResponse } from 'next'

const STATIC_OASIS_STATS = {
  monthlyVolume: 3900000000,
  managedOnOasis: 1440000000,
  medianVaultSize: 212000,
}

export default function (_: NextApiRequest, res: NextApiResponse) {
  res.send(STATIC_OASIS_STATS)
}
