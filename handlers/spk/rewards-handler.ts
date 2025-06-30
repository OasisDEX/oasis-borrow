import BigNumber from 'bignumber.js'
import type { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'
import * as z from 'zod'

const paramsSchema = z.object({
  address: z.string(),
})

export async function get(req: NextApiRequest, res: NextApiResponse) {
  const config = getConfig()
  const sparkRewardsClaimEndpoint = config?.publicRuntimeConfig.sparkRewardsClaimEndpoint
  const { address } = paramsSchema.parse(req.query)
  try {
    if (!address) {
      return res.status(400).json({ error: 'Address is required' })
    }
    if (!sparkRewardsClaimEndpoint) {
      console.error('sparkRewardsClaimEndpoint is not set')
      return res.status(500).json({
        error: 'sparkRewardsClaimEndpoint is not set',
      })
    }
    const requesturl = `${sparkRewardsClaimEndpoint}?account=${address}`
    const apiResult = await fetch(requesturl)
    if (!apiResult.ok) {
      console.error(`Error while loading rewards from API: ${apiResult.statusText}`)
      return res.status(apiResult.status || 500).json({
        error: 'Error while loading rewards from API',
        status: apiResult.status,
        statusText: apiResult.statusText,
      })
    }
    const apiData = await apiResult.json()
    return res.status(200).json({
      canClaim: apiData.canClaim,
      toClaim: apiData.cumulativeToClaim,
      toClaimFormatted: new BigNumber(apiData.cumulativeToClaim).div(10 ** 18).toFixed(4),
      claimed: apiData.cumulativeClaimed,
      claimedFormatted: new BigNumber(apiData.cumulativeClaimed).div(10 ** 18).toFixed(4),
      tx: apiData.claimMulticallTransaction,
      raw: apiData,
    })
  } catch (e) {
    console.error(`Error while loading rewards: ${e}`)
    return res.status(e instanceof z.ZodError ? 400 : 500).json({
      error: 'Error while loading rewards from blockchain',
      details:
        e instanceof z.ZodError ? e.errors : e instanceof Error ? e.message : 'Unknown error',
    })
  }
}
