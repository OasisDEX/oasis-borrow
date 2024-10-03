import { mainnetContracts } from 'blockchain/contracts/mainnet'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as z from 'zod'

const paramsSchema = z.object({
  walletAddress: z.string(),
})

export async function getCleRewards(req: NextApiRequest, res: NextApiResponse) {
  const { walletAddress } = paramsSchema.parse(req.query)

  try {
    const response = await fetch(
      `https://info-sky.blockanalitica.com/api/v1/farms/${mainnetContracts.sky.stakingCle.address}/wallets/${walletAddress}/?format=json`,
    ).then((resp) => resp.json())

    return res.status(200).json(response)
  } catch (error) {
    console.error('Failed to fetch earned CLE rewards:', error)

    return res.status(400).json({ error: `${error}`, reward_balance: '0' })
  }
}
