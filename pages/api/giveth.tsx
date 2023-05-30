import { withSentry } from '@sentry/nextjs'
import { topupAddress } from 'helpers/api/tenderly/tenderlyOperations'
import { NextApiRequest, NextApiResponse } from 'next'

async function givethHandler(req: NextApiRequest, res: NextApiResponse) {
  const rpcForkSecret = req.query.rpcForkSecret! as string
  if (rpcForkSecret !== process.env.RPC_FORK_SECRET) {
    return res.status(401).end()
  }
  switch (req.method) {
    case 'GET':
      const userAddress = req.query.user! as string
      const amount = parseInt(req.query.amount! as string)
      await topupAddress(userAddress, amount)
      return res.status(200).json({ userAddress, amount })
    default:
      return res.status(405).end()
  }
}

export default withSentry(givethHandler)
